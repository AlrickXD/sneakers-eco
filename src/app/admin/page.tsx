'use client'

import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useAdmin, PlatformStats } from '@/hooks/useAdmin'
import { AdminGuard } from '@/components/admin/AdminGuard'
import {
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Trash2,
  Shield,
  Settings,
  BarChart3,
  Eye,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
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
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              🛡️ Administration
            </h1>
            <p className="text-gray-600">
              Tableau de bord administrateur - Vue d&apos;ensemble de la plateforme
            </p>
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
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-black">{stats.total_users}</div>
                    <div className="text-sm text-gray-600">Utilisateurs total</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {stats.total_clients} clients • {stats.total_vendeurs} vendeurs • {stats.total_admins} admins
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-black">{stats.total_products}</div>
                    <div className="text-sm text-gray-600">Produits total</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-black">{stats.total_orders}</div>
                    <div className="text-sm text-gray-600">Commandes total</div>
                  </div>
                </div>
                {stats.pending_orders > 0 && (
                  <div className="mt-3 text-xs text-purple-600">
                    {stats.pending_orders} en attente
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-black">
                      {stats.total_revenue.toFixed(0)} €
                    </div>
                    <div className="text-sm text-gray-600">Chiffre d&apos;affaires</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-green-600">
                  {stats.paid_orders} commandes payées
                </div>
              </div>
            </div>

            {/* Alertes */}
            {stats.pending_orders > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Alertes</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="text-orange-700">
                    • {stats.pending_orders} commande{stats.pending_orders !== 1 ? 's' : ''} en attente de traitement
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/users"
            className="bg-black text-white p-6 rounded-lg hover:bg-gray-800 transition-colors group"
          >
            <Users className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg mb-2">Gestion des utilisateurs</h3>
            <p className="text-sm opacity-90">
              Gérer les utilisateurs et leurs rôles
            </p>
          </Link>


          <Link
            href="/admin/analytics"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors group"
          >
            <BarChart3 className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-lg mb-2">Analyses avancées</h3>
            <p className="text-sm opacity-90">
              Statistiques détaillées et rapports
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-6 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-colors group"
          >
            <Settings className="h-8 w-8 mb-3 group-hover:rotate-90 transition-transform" />
            <h3 className="font-semibold text-lg mb-2">Paramètres</h3>
            <p className="text-sm opacity-90">
              Configuration de la plateforme
            </p>
          </Link>

        </div>

        {/* Informations système */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Informations système
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
            <div>
              <div className="text-gray-600 mb-1">Plateforme</div>
              <div className="font-medium">Sneakers-Eco v2.0</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Base de données</div>
              <div className="font-medium">Supabase PostgreSQL</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Paiements</div>
              <div className="font-medium">Stripe (mode test)</div>
            </div>
            <div>
              <div className="text-gray-600 mb-1">Dernière mise à jour</div>
              <div className="font-medium">{new Date().toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AdminGuard>
  )
}
