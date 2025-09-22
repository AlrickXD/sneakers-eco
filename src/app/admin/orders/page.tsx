'use client'

import { useEffect, useState } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { 
  ShoppingBag, 
  User,
  Package,
  DollarSign,
  Calendar,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface OrderWithDetails {
  id: string
  user_id: string
  status: 'pending' | 'paid' | 'canceled' | 'fulfilled'
  total_eur: number
  created_at: string
  profiles?: {
    display_name: string
  }
  order_items: Array<{
    id: string
    sku: string
    quantity: number
    unit_price_eur: number
    product_variants?: {
      size: string
      products?: {
        name: string
        images: string
      }
    }
  }>
}

export default function AdminOrdersPage() {
  const { getAllOrders, updateOrderStatus, loading, error } = useAdmin()
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderWithDetails[]>([])
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'canceled' | 'fulfilled'>('all')

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchTerm, statusFilter])

  const loadOrders = async () => {
    const data = await getAllOrders()
    setOrders(data)
  }

  const filterOrders = () => {
    let filtered = orders

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_items.some(item => 
          item.product_variants?.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'paid' | 'canceled' | 'fulfilled') => {
    setUpdatingOrder(orderId)
    const success = await updateOrderStatus(orderId, newStatus)
    
    if (success) {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    }
    
    setUpdatingOrder(null)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-blue-100 text-blue-800 border-blue-200',
      fulfilled: 'bg-green-100 text-green-800 border-green-200',
      canceled: 'bg-red-100 text-red-800 border-red-200'
    }

    const labels = {
      pending: 'En attente',
      paid: 'Payée',
      fulfilled: 'Expédiée',
      canceled: 'Annulée'
    }

    const icons = {
      pending: <Clock className="h-3 w-3" />,
      paid: <CheckCircle className="h-3 w-3" />,
      fulfilled: <Truck className="h-3 w-3" />,
      canceled: <XCircle className="h-3 w-3" />
    }

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const getTotalItems = (order: OrderWithDetails) => {
    return order.order_items.reduce((total, item) => total + item.quantity, 0)
  }

  if (loading && orders.length === 0) {
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
                🛒 Gestion des commandes
              </h1>
              <p className="text-gray-600">
                Suivre et gérer toutes les commandes de la plateforme
              </p>
            </div>
          </div>
          <button
            onClick={loadOrders}
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
              onClick={loadOrders}
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
              <ShoppingBag className="h-6 w-6 text-blue-600" />
              <div>
                <div className="text-xl font-bold text-black">{orders.length}</div>
                <div className="text-sm text-gray-600">Total commandes</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-yellow-600" />
              <div>
                <div className="text-xl font-bold text-black">
                  {orders.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">En attente</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-xl font-bold text-black">
                  {orders.filter(o => o.status === 'paid' || o.status === 'fulfilled').length}
                </div>
                <div className="text-sm text-gray-600">Payées</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-xl font-bold text-black">
                  {orders
                    .filter(o => o.status === 'paid' || o.status === 'fulfilled')
                    .reduce((total, order) => total + order.total_eur, 0)
                    .toFixed(0)}€
                </div>
                <div className="text-sm text-gray-600">Chiffre d'affaires</div>
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
                placeholder="Rechercher par ID, client ou produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Filtre par statut */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'paid' | 'canceled' | 'fulfilled')}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="paid">Payées</option>
                <option value="fulfilled">Expédiées</option>
                <option value="canceled">Annulées</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-black">
              Commandes ({filteredOrders.length})
            </h2>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucune commande trouvée avec ces critères' 
                  : 'Aucune commande trouvée'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-mono text-sm font-medium text-black">
                          #{order.id.slice(-8)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          {order.profiles?.display_name || 'Client inconnu'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-black">{order.total_eur}€</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {getStatusBadge(order.status)}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="h-4 w-4" />
                        {getTotalItems(order)} article{getTotalItems(order) !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Actions de changement de statut */}
                    <div className="flex items-center gap-2">
                      {updatingOrder === order.id ? (
                        <div className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          <span className="text-sm text-gray-500">Mise à jour...</span>
                        </div>
                      ) : (
                        <>
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(order.id, 'paid')}
                                className="flex items-center gap-1 bg-blue-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <CheckCircle className="h-4 w-4" />
                                Marquer payée
                              </button>
                              <button
                                onClick={() => handleStatusChange(order.id, 'canceled')}
                                className="flex items-center gap-1 bg-red-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <XCircle className="h-4 w-4" />
                                Annuler
                              </button>
                            </>
                          )}
                          {order.status === 'paid' && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'fulfilled')}
                              className="flex items-center gap-1 bg-green-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Truck className="h-4 w-4" />
                              Marquer expédiée
                            </button>
                          )}
                          {(order.status === 'canceled' || order.status === 'fulfilled') && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'paid')}
                              className="flex items-center gap-1 bg-gray-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Restaurer
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Articles de la commande */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-black mb-3">Articles commandés :</h4>
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {item.product_variants?.products?.images && (
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                <img
                                  src={item.product_variants.products.images.split('|')[0]}
                                  alt={item.product_variants.products.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-black">
                                {item.product_variants?.products?.name || 'Produit inconnu'}
                              </div>
                              <div className="text-xs text-gray-600">
                                Taille: {item.product_variants?.size} • SKU: {item.sku}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-black">
                              {item.quantity} × {item.unit_price_eur}€
                            </div>
                            <div className="text-xs text-gray-600">
                              = {(item.quantity * item.unit_price_eur).toFixed(2)}€
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informations importantes */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Gestion des commandes
            </h3>
            <div className="text-blue-700 text-sm space-y-1">
              <p>• <strong>En attente :</strong> Commande créée, paiement non confirmé</p>
              <p>• <strong>Payée :</strong> Paiement confirmé, prête à expédier</p>
              <p>• <strong>Expédiée :</strong> Commande envoyée au client</p>
              <p>• <strong>Annulée :</strong> Commande annulée</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Actions importantes
            </h3>
            <div className="text-yellow-700 text-sm space-y-1">
              <p>• Marquez les commandes payées dès réception du paiement</p>
              <p>• Passez en "Expédiée" après envoi du colis</p>
              <p>• Les changements de statut sont immédiats</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AdminGuard>
  )
}
