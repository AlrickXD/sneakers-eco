'use client'

import { useEffect, useState } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { 
  Package, 
  Trash2, 
  Eye,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  User,
  Tag,
  DollarSign,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface ProductWithSeller {
  product_id: string
  name: string
  images: string
  seller_id: string
  created_at: string
  profiles?: {
    display_name: string
  }
  product_variants: Array<{
    sku: string
    size: string
    stock: number
    price_eur: number
    etat: 'neuf' | 'seconde-main'
  }>
}

export default function AdminProductsPage() {
  const { getAllProducts, deleteProduct, loading, error } = useAdmin()
  const [products, setProducts] = useState<ProductWithSeller[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithSeller[]>([])
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [etatFilter, setEtatFilter] = useState<'all' | 'neuf' | 'seconde-main'>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, etatFilter])

  const loadProducts = async () => {
    const data = await getAllProducts()
    setProducts(data)
  }

  const filterProducts = () => {
    let filtered = products

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrer par état
    if (etatFilter !== 'all') {
      filtered = filtered.filter(product => 
        product.product_variants.some(variant => variant.etat === etatFilter)
      )
    }

    setFilteredProducts(filtered)
  }

  const handleDeleteProduct = async (productId: string) => {
    setDeletingProduct(productId)
    const success = await deleteProduct(productId)
    
    if (success) {
      setProducts(products.filter(product => product.product_id !== productId))
    }
    
    setDeletingProduct(null)
    setShowDeleteConfirm(null)
  }

  const getTotalStock = (variants: ProductWithSeller['product_variants']) => {
    return variants.reduce((total, variant) => total + variant.stock, 0)
  }

  const getPriceRange = (variants: ProductWithSeller['product_variants']) => {
    const prices = variants.map(v => v.price_eur)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return min === max ? `${min}€` : `${min}€ - ${max}€`
  }

  const getEtatBadge = (variants: ProductWithSeller['product_variants']) => {
    const etats = [...new Set(variants.map(v => v.etat))]
    return etats.map(etat => (
      <span
        key={etat}
        className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-1 ${
          etat === 'neuf' 
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-orange-100 text-orange-800 border border-orange-200'
        }`}
      >
        {etat === 'neuf' ? 'Neuf' : 'Seconde main'}
      </span>
    ))
  }

  if (loading && products.length === 0) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <LoadingSpinner size="lg" />
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                📦 Gestion des produits
              </h1>
              <p className="text-gray-600">
                Valider, modifier et supprimer les produits de la plateforme
              </p>
            </div>
          </div>
          <button
            onClick={loadProducts}
            disabled={loading}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-blue-600" />
              <div>
                <div className="text-xl font-bold text-black">{products.length}</div>
                <div className="text-sm text-gray-600">Produits total</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Tag className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-xl font-bold text-black">
                  {products.filter(p => p.product_variants.some(v => v.etat === 'neuf')).length}
                </div>
                <div className="text-sm text-gray-600">Produits neufs</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Tag className="h-6 w-6 text-orange-600" />
              <div>
                <div className="text-xl font-bold text-black">
                  {products.filter(p => p.product_variants.some(v => v.etat === 'seconde-main')).length}
                </div>
                <div className="text-sm text-gray-600">Seconde main</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <div className="text-xl font-bold text-black">
                  {products.filter(p => getTotalStock(p.product_variants) === 0).length}
                </div>
                <div className="text-sm text-gray-600">Rupture de stock</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom de produit ou vendeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Filtre par état */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={etatFilter}
                onChange={(e) => setEtatFilter(e.target.value as 'all' | 'neuf' | 'seconde-main')}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              >
                <option value="all">Tous les états</option>
                <option value="neuf">Neuf</option>
                <option value="seconde-main">Seconde main</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des produits */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-black">
              Produits ({filteredProducts.length})
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || etatFilter !== 'all' 
                  ? 'Aucun produit trouvé avec ces critères' 
                  : 'Aucun produit trouvé'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      État
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const totalStock = getTotalStock(product.product_variants)
                    const priceRange = getPriceRange(product.product_variants)
                    
                    return (
                      <tr key={product.product_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                              {product.images ? (
                                <img
                                  src={product.images.split('|')[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-black max-w-xs truncate">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                ID: {product.product_id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {product.profiles?.display_name || 'Vendeur inconnu'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-black">{priceRange}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${
                            totalStock === 0 ? 'text-red-600' : 
                            totalStock <= 5 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {totalStock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getEtatBadge(product.product_variants)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(product.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {deletingProduct === product.product_id ? (
                              <div className="flex items-center gap-2">
                                <LoadingSpinner size="sm" />
                                <span className="text-sm text-red-500">Suppression...</span>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => window.open(`/p/${product.product_id}`, '_blank')}
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                  Voir
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(product.product_id)}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Supprimer
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-black">Confirmer la suppression</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce produit ? Cette action supprimera également tous ses variants et est irréversible.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteProduct(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Informations importantes */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gestion des produits
            </h3>
            <div className="text-blue-700 text-sm space-y-1">
              <p>• Vous pouvez voir et supprimer tous les produits</p>
              <p>• Les produits supprimés ne peuvent pas être récupérés</p>
              <p>• La suppression affecte aussi tous les variants</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Attention
            </h3>
            <div className="text-yellow-700 text-sm space-y-1">
              <p>• Les produits en rupture de stock sont signalés en rouge</p>
              <p>• Stock faible (≤5) signalé en orange</p>
              <p>• Vérifiez avant de supprimer un produit populaire</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AdminGuard>
  )
}
