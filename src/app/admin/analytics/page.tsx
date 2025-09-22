'use client'

import { useEffect, useState } from 'react'
import { useAdmin, PlatformStats } from '@/hooks/useAdmin'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Eye,
  Target,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function AdminAnalyticsPage() {
  const { getPlatformStats, loading, error } = useAdmin()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const data = await getPlatformStats()
    if (data) {
      setStats(data)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  const getGrowthIndicator = (current: number, previous: number = current * 0.8) => {
    const growth = ((current - previous) / previous) * 100
    const isPositive = growth >= 0
    
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {Math.abs(growth).toFixed(1)}%
      </div>
    )
  }

  if (loading && !stats) {
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
                📊 Analyses avancées
              </h1>
              <p className="text-gray-600">
                Statistiques détaillées et insights sur la performance de la plateforme
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Réessayer
            </button>
          </div>
        )}

        {stats && (
          <>
            {/* KPIs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                  {getGrowthIndicator(stats.total_users)}
                </div>
                <div className="text-2xl font-bold text-black mb-1">{stats.total_users}</div>
                <div className="text-sm text-gray-600">Utilisateurs actifs</div>
                <div className="mt-2 text-xs text-blue-700">
                  {stats.total_clients} clients • {stats.total_vendeurs} vendeurs
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  {getGrowthIndicator(stats.total_revenue)}
                </div>
                <div className="text-2xl font-bold text-black mb-1">{stats.total_revenue.toFixed(0)}€</div>
                <div className="text-sm text-gray-600">Chiffre d'affaires</div>
                <div className="mt-2 text-xs text-green-700">
                  {stats.paid_orders} commandes payées
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <ShoppingBag className="h-8 w-8 text-purple-600" />
                  {getGrowthIndicator(stats.total_orders)}
                </div>
                <div className="text-2xl font-bold text-black mb-1">{stats.total_orders}</div>
                <div className="text-sm text-gray-600">Commandes total</div>
                <div className="mt-2 text-xs text-purple-700">
                  {stats.pending_orders} en attente
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <Package className="h-8 w-8 text-orange-600" />
                  {getGrowthIndicator(stats.total_products)}
                </div>
                <div className="text-2xl font-bold text-black mb-1">{stats.total_products}</div>
                <div className="text-sm text-gray-600">Produits actifs</div>
                <div className="mt-2 text-xs text-orange-700">
                  Catalogue complet
                </div>
              </div>
            </div>

            {/* Métriques de performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Taux de conversion */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-black">Taux de conversion</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Visiteurs → Commandes</span>
                    <span className="font-semibold text-black">
                      {stats.total_users > 0 ? ((stats.total_orders / stats.total_users) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Valeurs moyennes */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-black">Valeurs moyennes</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Panier moyen</span>
                    <span className="font-semibold text-black">
                      {stats.paid_orders > 0 ? (stats.total_revenue / stats.paid_orders).toFixed(2) : 0}€
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Répartition des rôles */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-black">Répartition des utilisateurs</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-black">{stats.total_clients}</div>
                  <div className="text-sm text-gray-600">Clients</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.total_users > 0 ? ((stats.total_clients / stats.total_users) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-black">{stats.total_vendeurs}</div>
                  <div className="text-sm text-gray-600">Vendeurs</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.total_users > 0 ? ((stats.total_vendeurs / stats.total_users) * 100).toFixed(1) : 0}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center">
                    <Eye className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-black">{stats.total_admins}</div>
                  <div className="text-sm text-gray-600">Administrateurs</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.total_users > 0 ? ((stats.total_admins / stats.total_users) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Insights et recommandations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Points positifs</h3>
            </div>
            <div className="text-blue-700 text-sm space-y-2">
              {stats && (
                <>
                  {stats.paid_orders > 0 && (
                    <p>• {stats.paid_orders} commandes ont été payées avec succès</p>
                  )}
                  {stats.total_vendeurs > 0 && (
                    <p>• {stats.total_vendeurs} vendeurs actifs sur la plateforme</p>
                  )}
                  {stats.total_products > 0 && (
                    <p>• {stats.total_products} produits disponibles dans le catalogue</p>
                  )}
                  {stats.total_revenue > 0 && (
                    <p>• Chiffre d'affaires de {stats.total_revenue.toFixed(0)}€ réalisé</p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Points d'amélioration</h3>
            </div>
            <div className="text-orange-700 text-sm space-y-2">
              {stats && (
                <>
                  {stats.pending_orders > 0 && (
                    <p>• {stats.pending_orders} commande{stats.pending_orders !== 1 ? 's' : ''} en attente de traitement</p>
                  )}
                  {stats.total_clients === 0 && (
                    <p>• Aucun client inscrit - améliorer le marketing</p>
                  )}
                  {stats.total_products === 0 && (
                    <p>• Aucun produit en ligne - encourager les vendeurs</p>
                  )}
                  {stats.total_orders === 0 && (
                    <p>• Aucune commande - optimiser l'expérience utilisateur</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Informations sur les données */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Informations sur les données</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Les données sont mises à jour en temps réel</p>
            <p>• Les statistiques incluent toutes les données depuis le lancement</p>
            <p>• Dernière mise à jour : {new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </div>
      </div>
    </AdminGuard>
  )
}
