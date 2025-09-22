'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { supabase } from '@/lib/supabase'
import { OrderWithItems } from '@/types/database'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ShoppingBag, Package, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getFirstImage } from '@/utils/imageUtils'

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      // Charger TOUTES les commandes (modèle centralisé)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product_variants (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      setOrders(ordersData || [])
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des commandes:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: 'paid' | 'pending' | 'canceled' | 'fulfilled') => {
    setUpdatingOrder(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      // Mettre à jour localement
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (error: unknown) {
      console.error('Erreur lors de la mise à jour:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
    } finally {
      setUpdatingOrder(null)
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

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true
    return order.status === statusFilter
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    fulfilled: orders.filter(o => o.status === 'fulfilled').length,
    revenue: orders
      .filter(o => o.status !== 'canceled')
      .reduce((sum, order) => {
        const sellerTotal = order.order_items.reduce((itemSum, item) => 
          itemSum + (item.unit_price_eur * item.quantity), 0
        )
        return sum + sellerTotal
      }, 0)
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/seller"
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour au dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-black">Toutes les Commandes</h1>
            <p className="text-gray-600 mt-2">
              Gérez l'ensemble des commandes de la plateforme
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-black">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total commandes</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-black">{stats.paid}</div>
                  <div className="text-sm text-gray-600">À expédier</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-black">{stats.fulfilled}</div>
                  <div className="text-sm text-gray-600">Expédiées</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-black">{stats.pending}</div>
                  <div className="text-sm text-gray-600">En attente</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-black">{stats.revenue.toFixed(2)} €</div>
                  <div className="text-sm text-gray-600">Revenus</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all' 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Toutes ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'pending' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                En attente ({stats.pending})
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'paid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                À expédier ({stats.paid})
              </button>
              <button
                onClick={() => setStatusFilter('fulfilled')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'fulfilled' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Expédiées ({stats.fulfilled})
              </button>
            </div>
          </div>

          {/* Liste des commandes */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                {statusFilter === 'all' ? 'Aucune commande' : 'Aucune commande avec ce statut'}
              </h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? 'Vous n\'avez pas encore reçu de commandes.'
                  : 'Aucune commande ne correspond à ce filtre.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const orderTotal = order.order_items.reduce((sum, item) => 
                  sum + (item.unit_price_eur * item.quantity), 0
                )
                
                return (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          Commande #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-black">
                          {orderTotal.toFixed(2)} €
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>

                    {/* Produits de la commande */}
                    <div className="space-y-3 mb-4">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="h-16 w-16 relative">
                            {item.product_variants.images && getFirstImage(item.product_variants.images) ? (
                              <Image
                                src={getFirstImage(item.product_variants.images) || '/placeholder.jpg'}
                                alt={item.product_variants.name}
                                fill
                                className="object-cover rounded-lg"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-black">
                              {item.product_variants.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Taille {item.product_variants.taille} • {item.product_variants.etat}
                            </p>
                            <p className="text-sm text-gray-500">
                              SKU: {item.product_variants.sku}
                            </p>
                            <p className="text-sm text-gray-500">
                              Quantité: {item.quantity} • {item.unit_price_eur.toFixed(2)} € chacun
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-black">
                              {(item.unit_price_eur * item.quantity).toFixed(2)} €
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Informations de livraison */}
                    {(order.shipping_name || order.shipping_address_line1) && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800 mb-2">
                          <Package className="h-4 w-4" />
                          <span className="font-medium">📍 Adresse de livraison</span>
                        </div>
                        <div className="text-sm text-blue-700">
                          {order.shipping_name && (
                            <p className="font-medium">{order.shipping_name}</p>
                          )}
                          {order.shipping_address_line1 && (
                            <p>{order.shipping_address_line1}</p>
                          )}
                          {order.shipping_address_line2 && (
                            <p>{order.shipping_address_line2}</p>
                          )}
                          {(order.shipping_postal_code || order.shipping_city) && (
                            <p>
                              {order.shipping_postal_code} {order.shipping_city}
                            </p>
                          )}
                          {order.shipping_country && (
                            <p className="font-medium mt-1">{order.shipping_country}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Indication étiquette */}
                    {order.needs_label && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <Package className="h-4 w-4" />
                          <span className="font-medium">📦 Envoyez un bordereau</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          Le client a demandé à recevoir un bordereau d'envoi avec cette commande.
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {order.status === 'paid' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'fulfilled')}
                          disabled={updatingOrder === order.id}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          {updatingOrder === order.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          Marquer comme expédiée
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}


