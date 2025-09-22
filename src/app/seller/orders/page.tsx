'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { supabase } from '@/lib/supabase'
import { OrderWithItems } from '@/types/database'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ShoppingBag, Package, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft, ChevronDown, ChevronUp, Mail, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getFirstImage } from '@/utils/imageUtils'

interface OrderWithUserDetails extends OrderWithItems {
  user_email?: string
  user_name?: string
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<OrderWithUserDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      // Charger les commandes directement avec customer_email depuis la DB
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

      // Récupérer les noms d'affichage pour chaque commande
      const ordersWithUserDetails = await Promise.all(
        (ordersData || []).map(async (order) => {
          try {
            const { data: userData } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', order.user_id)
              .single()

            return {
              ...order,
              user_name: userData?.display_name || 'Nom non disponible',
              user_email: order.customer_email || 'Email non disponible' // Utiliser customer_email de la DB
            } as OrderWithUserDetails
          } catch (err) {
            return {
              ...order,
              user_name: 'Nom non disponible',
              user_email: order.customer_email || 'Email non disponible'
            } as OrderWithUserDetails
          }
        })
      )

      setOrders(ordersWithUserDetails)
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

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
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
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* En-tête du tableau */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-3">Commande</div>
                  <div className="col-span-2">Client</div>
                  <div className="col-span-2">Produits</div>
                  <div className="col-span-1">Total</div>
                  <div className="col-span-2">Statut</div>
                  <div className="col-span-1">Date</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Lignes des commandes */}
              {filteredOrders.map((order) => {
                const orderTotal = order.order_items.reduce((sum, item) => 
                  sum + (item.unit_price_eur * item.quantity), 0
                )
                const isExpanded = expandedOrders.has(order.id)
                const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0)
                
                return (
                  <div key={order.id} className="border-b border-gray-200 last:border-b-0">
                    {/* Rangée principale (compacte) */}
                    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Commande */}
                        <div className="col-span-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleOrderExpansion(order.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                            <div>
                              <p className="font-semibold text-black">#{order.id.slice(-8)}</p>
                              {order.needs_label && (
                                <span className="inline-flex items-center gap-1 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                                  📦 Avec bordereau de livraison
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Client */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-black">
                                {order.user_name || 'Nom indisponible'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Produits */}
                        <div className="col-span-2">
                          <p className="text-sm text-gray-900">
                            {itemCount} article{itemCount > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.order_items.length} produit{order.order_items.length > 1 ? 's' : ''}
                          </p>
                        </div>

                        {/* Total */}
                        <div className="col-span-1">
                          <p className="font-bold text-black">{orderTotal.toFixed(2)} €</p>
                        </div>

                        {/* Statut */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(order.status)}
                            {order.status === 'paid' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'fulfilled')}
                                disabled={updatingOrder === order.id}
                                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                              >
                                {updatingOrder === order.id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-3 w-3" />
                                    Expédier
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Date */}
                        <div className="col-span-1">
                          <p className="text-xs text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1">
                          <button
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {isExpanded ? 'Réduire' : 'Détails'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Détails étendus */}
                    {isExpanded && (
                      <div className="px-6 pb-6 bg-gray-50 border-t border-gray-200">
                        <div className="pt-4 space-y-4">
                          {/* Produits détaillés */}
                          <div>
                            <h4 className="font-medium text-black mb-3 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Produits commandés
                            </h4>
                            <div className="space-y-3">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="h-16 w-16 relative flex-shrink-0">
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
                                    <h5 className="font-medium text-black">{item.product_variants.name}</h5>
                                    <p className="text-sm text-gray-600">
                                      Taille {item.product_variants.taille} • {item.product_variants.etat}
                                    </p>
                                    <p className="text-xs text-gray-500">SKU: {item.product_variants.sku}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-black">
                                      {item.quantity} × {item.unit_price_eur.toFixed(2)} €
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      = {(item.unit_price_eur * item.quantity).toFixed(2)} €
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Informations de livraison et email */}
                          {(order.shipping_name || order.shipping_address_line1) && (
                            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                              <h4 className="font-medium text-gray-800 mb-1 flex items-center gap-2 text-sm">
                                <Package className="h-3 w-3" />
                                📍 Adresse de livraison
                              </h4>
                              <div className="text-xs text-gray-700 space-y-0.5">
                                {order.shipping_name && (
                                  <p className="font-medium text-gray-900">{order.shipping_name}</p>
                                )}
                                {order.shipping_address_line1 && <p>{order.shipping_address_line1}</p>}
                                {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                                {(order.shipping_postal_code || order.shipping_city) && (
                                  <p>{order.shipping_postal_code} {order.shipping_city}</p>
                                )}
                                {order.shipping_country && (
                                  <p className="font-medium text-gray-900">{order.shipping_country}</p>
                                )}
                                {/* Email du client dans la section livraison */}
                                {(order.customer_email || order.user_email) && (
                                  <div className="flex items-center gap-1 pt-1 border-t border-gray-300 mt-2">
                                    <Mail className="h-3 w-3 text-gray-500" />
                                    <span className="font-medium text-gray-800">Email :</span>
                                    <span className="text-gray-700">{order.customer_email || order.user_email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
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


