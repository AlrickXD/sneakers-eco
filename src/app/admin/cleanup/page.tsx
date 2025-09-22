'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle, Package } from 'lucide-react'
import Link from 'next/link'

interface OrphanedProduct {
  product_id: string
  name: string
  categorie: string
  variant_count: number
  total_stock: number
  status: string
}

export default function CleanupPage() {
  const [products, setProducts] = useState<OrphanedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cleaning, setCleaning] = useState(false)
  const [cleaned, setCleaned] = useState(false)

  useEffect(() => {
    loadOrphanedProducts()
  }, [])

  const loadOrphanedProducts = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_orphaned_products')

      if (error) {
        // Fallback si la fonction RPC n'existe pas
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            product_id,
            name,
            categorie,
            product_variants(count)
          `)

        if (productsError) throw productsError

        // Simuler les données orphelines
        const orphaned: OrphanedProduct[] = []
        for (const product of productsData || []) {
          const { count } = await supabase
            .from('product_variants')
            .select('*', { count: 'exact' })
            .eq('product_id', product.product_id)

          const { data: variants } = await supabase
            .from('product_variants')
            .select('stock')
            .eq('product_id', product.product_id)

          const totalStock = variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0

          if (count === 0 || totalStock <= 0) {
            orphaned.push({
              product_id: product.product_id,
              name: product.name,
              categorie: product.categorie,
              variant_count: count || 0,
              total_stock: totalStock,
              status: count === 0 ? 'Aucune variante' : 'Rupture de stock'
            })
          }
        }

        setProducts(orphaned)
      } else {
        setProducts(data || [])
      }
    } catch (error: unknown) {
      console.error('Erreur lors du chargement:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const cleanOrphanedProducts = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${products.length} produits obsolètes ? Cette action est irréversible.`)) return

    setCleaning(true)
    try {
      const { error } = await supabase
        .rpc('cleanup_orphaned_products')

      if (error) {
        // Fallback manuel
        for (const product of products) {
          await supabase.from('product_variants').delete().eq('product_id', product.product_id)
          await supabase.from('products').delete().eq('product_id', product.product_id)
        }
      }

      setCleaned(true)
      setProducts([])
    } catch (error: unknown) {
      console.error('Erreur lors du nettoyage:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
    } finally {
      setCleaning(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <div className="min-h-screen flex items-center justify-center bg-white">
          <LoadingSpinner size="lg" />
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour au dashboard admin
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Trash2 className="h-8 w-8 text-red-600" />
              <h1 className="text-3xl font-bold text-black">Nettoyage des produits</h1>
            </div>
            <p className="text-gray-600">
              Supprimer les produits obsolètes (sans stock ou sans variantes)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {cleaned && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-700">
                ✅ {products.length} produits supprimés avec succès !
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-black">{products.length}</div>
                  <div className="text-sm text-gray-600">Produits à supprimer</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-black">
                    {products.filter(p => p.variant_count === 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Sans variantes</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Trash2 className="h-8 w-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-black">
                    {products.filter(p => p.total_stock <= 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Rupture de stock</div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des produits */}
          {products.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                Aucun produit à nettoyer
              </h3>
              <p className="text-gray-600">
                Tous vos produits sont en ordre. Aucun produit obsolète trouvé.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-black mb-2">
                  Produits à supprimer ({products.length})
                </h2>
                <p className="text-gray-600">
                  Ces produits seront définitivement supprimés de la base de données.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variantes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.product_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-black">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              {product.product_id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {product.categorie}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.status === 'Aucune variante'
                              ? 'text-red-800 bg-red-100'
                              : 'text-orange-800 bg-orange-100'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {product.variant_count} variante{product.variant_count > 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            product.total_stock <= 0 ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {product.total_stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bouton de suppression */}
              <div className="p-6 border-t border-gray-200 bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-red-800 mb-1">
                      Supprimer tous les produits obsolètes
                    </h3>
                    <p className="text-sm text-red-600">
                      Cette action supprimera définitivement {products.length} produits de la base de données.
                    </p>
                  </div>
                  <button
                    onClick={cleanOrphanedProducts}
                    disabled={cleaning}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {cleaning ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Suppression...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-5 w-5" />
                        Supprimer {products.length} produits
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
