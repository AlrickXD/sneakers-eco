'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { supabase } from '@/lib/supabase'
import { ProductVariant, OrderWithItems } from '@/types/database'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Package, TrendingUp, AlertTriangle, ShoppingBag, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SellerStats {
  totalProducts: number
  lowStockItems: number
  totalOrders: number
  pendingOrders: number
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    lowStockItems: 0,
    totalOrders: 0,
    pendingOrders: 0
  })
  const [lowStockProducts, setLowStockProducts] = useState<ProductVariant[]>([])
  const [recentOrders, setRecentOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      // Charger TOUS les produits (modèle centralisé)
      const { data: allVariants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .order('sku', { ascending: false })

      if (variantsError) throw variantsError
      const variants = allVariants || []

      // Charger TOUTES les commandes (modèle centralisé)
      const { data: allOrdersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product_variants (*)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (ordersError) throw ordersError
      const orders = allOrdersData || []

      // Calculer les statistiques
      const lowStock = variants?.filter(v => v.stock <= 5 && v.stock > 0) || []
      const totalProducts = variants?.length || 0
      const totalOrders = orders?.length || 0
      const pendingOrders = orders?.filter(o => o.status === 'paid').length || 0

      console.log('📊 Statistiques Dashboard Vendeur:', {
        totalProducts: `${totalProducts} produits dans product_variants`,
        lowStockItems: `${lowStock.length} produits avec stock 1-5`,
        totalOrders: `${totalOrders} commandes dans orders`,
        pendingOrders: `${pendingOrders} commandes avec status 'paid'`,
        sampleLowStock: lowStock.slice(0, 3).map(p => `${p.name} (stock: ${p.stock})`)
      })

      setStats({
        totalProducts,
        lowStockItems: lowStock.length,
        totalOrders,
        pendingOrders
      })

      setLowStockProducts(lowStock.slice(0, 5))
      setRecentOrders(orders || [])

    } catch (error: unknown) {
      console.error('Erreur lors du chargement des données:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      fulfilled: 'bg-green-100 text-green-800',
      canceled: 'bg-red-100 text-red-800'
    }

    const labels = {
      pending: 'En attente',
      paid: 'Payée',
      fulfilled: 'Expédiée',
      canceled: 'Annulée'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <AuthGuard allowRoles={['vendeur', 'admin']}>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <LoadingSpinner size="lg" />
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowRoles={['vendeur', 'admin']}>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/account"
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Dashboard Centralisé
            </h1>
            <p className="text-gray-600">
              Gérez l'ensemble du catalogue et suivez toutes les ventes
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
              <button
                onClick={loadDashboardData}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-black">{stats.totalProducts}</div>
                  <div className="text-sm text-gray-600">Produits total</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-black">{stats.lowStockItems}</div>
                  <div className="text-sm text-gray-600">Stock faible</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-black">{stats.totalOrders}</div>
                  <div className="text-sm text-gray-600">Commandes totales</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-black">{stats.pendingOrders}</div>
                  <div className="text-sm text-gray-600">À expédier</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Link
              href="/seller/products/add"
              className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-8 w-8 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Ajouter un produit</h3>
              <p className="text-sm opacity-90">
                Mettre en vente une nouvelle chaussure
              </p>
            </Link>

            <Link
              href="/seller/products"
              className="bg-black text-white p-6 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Package className="h-8 w-8 mb-3" />
              <h3 className="font-semibold text-lg mb-2">Gérer les produits</h3>
              <p className="text-sm opacity-90">
                Modifier ou supprimer des produits existants
              </p>
            </Link>

            <Link
              href="/seller/orders"
              className="bg-white border border-gray-200 p-6 rounded-lg hover:border-black transition-colors"
            >
              <ShoppingBag className="h-8 w-8 mb-3 text-black" />
              <h3 className="font-semibold text-lg mb-2 text-black">Commandes</h3>
              <p className="text-sm text-gray-600">
                Voir et gérer les commandes clients
              </p>
            </Link>

            <div className="bg-gray-50 p-6 rounded-lg">
              <TrendingUp className="h-8 w-8 mb-3 text-gray-600" />
              <h3 className="font-semibold text-lg mb-2 text-black">Statistiques</h3>
              <p className="text-sm text-gray-600">
                Analyses détaillées (bientôt disponible)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Produits en stock faible */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-black">Stock faible</h2>
              </div>
              
              {lowStockProducts.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-600">Aucun produit en stock faible</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {lowStockProducts.map((product) => (
                    <div key={product.sku} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-black">{product.name}</h4>
                          <p className="text-sm text-gray-600">
                            Taille {product.taille} • {product.etat.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-orange-600">
                            {product.stock}
                          </span>
                          <p className="text-sm text-gray-600">en stock</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {lowStockProducts.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <Link
                    href="/seller/products"
                    className="text-black font-medium hover:underline"
                  >
                    Gérer les stocks →
                  </Link>
                </div>
              )}
            </div>

            {/* Commandes récentes */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-black">Commandes récentes</h2>
              </div>
              
              {recentOrders.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-600">Aucune commande récente</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-black">
                            #{order.id.slice(-8)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(order.status)}
                          <div className="font-semibold text-black mt-1">
                            {order.total_eur.toFixed(2)} €
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.order_items.length} article{order.order_items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              {recentOrders.length > 0 && (
                <div className="p-4 border-t border-gray-200">
                  <Link
                    href="/seller/orders"
                    className="text-black font-medium hover:underline"
                  >
                    Voir toutes les commandes →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
