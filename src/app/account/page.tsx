'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { supabase } from '@/lib/supabase'
import { OrderWithItems, ProductVariant } from '@/types/database'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { User, Package, ShoppingBag, Calendar, Store, TrendingUp, AlertTriangle, Trash2, Settings, Key, Mail, Eye, EyeOff, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getFirstImage } from '@/utils/imageUtils'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const { user, profile, signOut } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [sellerProducts, setSellerProducts] = useState<ProductVariant[]>([])
  const [sellerStats, setSellerStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    lowStockItems: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPersonalInfo, setShowPersonalInfo] = useState(true)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showSecurity, setShowSecurity] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [profileData, setProfileData] = useState({
    displayName: ''
  })

  useEffect(() => {
    if (user && profile) {
      // Initialiser les données de profil
      setProfileData({
        displayName: profile.display_name || ''
      })
      
      if (profile.role === 'client') {
        loadOrders()
      } else if (profile.role === 'vendeur') {
        loadSellerData()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile])

  const loadOrders = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product_variants (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur lors du chargement des commandes:', error)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadSellerData = async () => {
    if (!user) return

    try {
      // Pour les vendeurs, on charge juste les données de base
      // Les statistiques détaillées sont maintenant dans /seller
      console.log('Chargement des données vendeur pour la page profil')
      setLoading(false)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      console.error('Erreur lors du chargement des données vendeur:', error)
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)
    setError('')

    if (!passwordData.currentPassword) {
      setError('Veuillez saisir votre mot de passe actuel')
      setIsChangingPassword(false)
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas')
      setIsChangingPassword(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères')
      setIsChangingPassword(false)
      return
    }

    try {
      console.log('Tentative de changement de mot de passe pour:', user?.email)
      
      // Vérifier l'ancien mot de passe en tentant une connexion
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword
      })

      if (signInError) {
        console.error('Erreur de vérification ancien mot de passe:', signInError)
        setError('Mot de passe actuel incorrect')
        setIsChangingPassword(false)
        return
      }

      console.log('Ancien mot de passe vérifié avec succès')

      // Changer le mot de passe
      const { data: updateData, error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      console.log('Résultat changement mot de passe:', updateData)

      if (error) {
        console.error('Erreur lors du changement de mot de passe:', error)
        throw error
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
      alert('Mot de passe mis à jour avec succès dans la base de données')
    } catch (error: unknown) {
      console.error('Erreur complète changement mot de passe:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    setError('')

    try {
      console.log('Mise à jour du profil pour l\'utilisateur:', user?.id)
      console.log('Nouveau nom d\'affichage:', profileData.displayName)
      
      // Mettre à jour le profil dans la table profiles
      const { data, error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: profileData.displayName
        })
        .eq('id', user?.id)
        .select()

      console.log('Résultat de la mise à jour:', data)
      
      if (profileError) {
        console.error('Erreur lors de la mise à jour du profil:', profileError)
        throw profileError
      }

      alert('Profil mis à jour avec succès dans la base de données')
    } catch (error: unknown) {
      console.error('Erreur complète:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    setDeleting(true)
    try {
      // Supprimer le compte utilisateur (Supabase supprimera automatiquement les données liées via CASCADE)
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      
      if (error) {
        // Si l'admin delete ne fonctionne pas, essayer avec la méthode client
        const { error: clientError } = await supabase.rpc('delete_user')
        if (clientError) throw clientError
      }

      // Déconnecter l'utilisateur et rediriger avec un délai pour éviter l'écran noir
      await signOut()
      setTimeout(() => {
        router.push('/')
      }, 100)
      
    } catch (error: any) {
      console.error('Erreur lors de la suppression du compte:', error)
      setError('Erreur lors de la suppression du compte: ' + error.message)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
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

  return (
    <AuthGuard allowRoles={['client', 'vendeur', 'admin']}>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête du profil */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">
                  {profile?.display_name || user?.email}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">Rôle:</span>
                  <span className="text-sm font-medium text-black capitalize">
                    {profile?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques selon le rôle */}
          {profile?.role === 'client' ? (
            /* Statistiques Client */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-black">{orders.length}</div>
                    <div className="text-sm text-gray-600">Commandes totales</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-black">
                      {orders.filter(o => o.status === 'fulfilled').length}
                    </div>
                    <div className="text-sm text-gray-600">Commandes livrées</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-black">
                      {orders.filter(o => o.status === 'paid').length}
                    </div>
                    <div className="text-sm text-gray-600">En préparation</div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Contenu principal selon le rôle */}
          {profile?.role === 'client' ? (
            /* Section Commandes pour les clients */
            <div className="bg-white border border-gray-200 rounded-lg mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-black">Mes commandes</h2>
              </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-600 mb-4">Erreur: {error}</p>
                <button
                  onClick={loadOrders}
                  className="bg-black text-white px-4 py-2 rounded-lg"
                >
                  Réessayer
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-center">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-black mb-2">
                  Aucune commande
                </h3>
                <p className="text-gray-600 mb-4">
                  Vous n&apos;avez pas encore passé de commande.
                </p>
                <a
                  href="/products"
                  className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Découvrir nos produits
                </a>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-black">
                          Commande #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <div className="text-lg font-bold text-black mt-1">
                          {order.total_eur.toFixed(2)} €
                        </div>
                      </div>
                    </div>

                    {/* Articles de la commande */}
                    <div className="space-y-3">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                          <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            {getFirstImage(item.product_variants.images) ? (
                              <Image
                                src={getFirstImage(item.product_variants.images)!}
                                alt={item.product_variants.name}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                Pas d&apos;image
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-black truncate">
                              {item.product_variants.name}
                            </h4>
                            <div className="text-sm text-gray-600">
                              Taille {item.product_variants.taille} • {item.product_variants.etat.replace('_', ' ')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-black">
                              {item.quantity}x {item.unit_price_eur.toFixed(2)} €
                            </div>
                            <div className="text-sm font-semibold text-black">
                              {(item.quantity * item.unit_price_eur).toFixed(2)} €
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          ) : profile?.role === 'vendeur' ? (
            /* Sections de gestion de profil pour les vendeurs */
            <div className="space-y-6">
              {/* Section Informations personnelles */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => setShowPersonalInfo(!showPersonalInfo)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-black">Informations personnelles</h2>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${showPersonalInfo ? 'rotate-180' : ''}`} />
                </button>
                {showPersonalInfo && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <form onSubmit={handleProfileUpdate} className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Nom d'affichage
                        </label>
                        <input
                          type="text"
                          value={profileData.displayName}
                          onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Votre nom d'affichage"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Email (lecture seule)
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Pour changer d'email, contactez l'administrateur
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={isUpdatingProfile}
                          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdatingProfile ? 'Mise à jour...' : 'Mettre à jour'}
                        </button>
                        <Link
                          href="/seller"
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Espace vendeur
                        </Link>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Section Préférences */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-black">Préférences</h2>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${showPreferences ? 'rotate-180' : ''}`} />
                </button>
                {showPreferences && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <div className="font-medium text-black">Notifications email</div>
                          <div className="text-sm text-gray-600">Recevoir les notifications de commandes</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" disabled />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all opacity-50"></div>
                          </label>
                          <span className="text-xs text-gray-500 italic">Bientôt disponible</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <div className="font-medium text-black">Rôle</div>
                          <div className="text-sm text-gray-600">Vendeur - Accès complet au catalogue</div>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Vendeur
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <div className="font-medium text-black">Dernière connexion</div>
                          <div className="text-sm text-gray-600">
                            {new Date().toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section Sécurité */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => setShowSecurity(!showSecurity)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-gray-600" />
                    <h2 className="text-xl font-semibold text-black">Sécurité</h2>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-600 transition-transform ${showSecurity ? 'rotate-180' : ''}`} />
                </button>
                {showSecurity && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Mot de passe actuel *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Mot de passe actuel"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Nouveau mot de passe *
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Nouveau mot de passe (min 6 caractères)"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Confirmer le nouveau mot de passe *
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Confirmer le nouveau mot de passe"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isChangingPassword ? 'Changement...' : 'Changer le mot de passe'}
                      </button>
                    </form>
                  </div>
                )}
              </div>

            </div>
          ) : null}

          {/* Section Paramètres du compte - Seulement pour les clients */}
          {profile?.role === 'client' && (
            <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-black">Paramètres du compte</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Informations générales */}
                <div>
                  <h3 className="font-medium text-black mb-2">Informations générales</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Email :</strong> {user?.email}</p>
                    <p><strong>Rôle :</strong> {profile?.role}</p>
                    <p><strong>Membre depuis :</strong> {new Date(profile?.created_at || '').toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                
                {/* Séparateur */}
                <div className="border-t border-gray-200 pt-4">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 transition-colors list-none flex items-center gap-2">
                      <span className="group-open:rotate-90 transition-transform">▶</span>
                      Options avancées
                    </summary>
                    <div className="mt-3 pl-6 border-l-2 border-gray-100">
                      <div className="flex items-start gap-3">
                        <Trash2 className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-700 mb-1 text-sm">
                            Supprimer mon compte
                          </h4>
                          <p className="text-gray-500 text-xs mb-3">
                            Suppression définitive de toutes vos données.
                          </p>
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-red-600 hover:text-red-700 text-xs underline transition-colors"
                          >
                            Supprimer définitivement
                          </button>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Modal de confirmation */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center gap-3 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-black">
                    Confirmer la suppression
                  </h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera toutes vos données.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={deleting}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Suppression...' : 'Supprimer'}
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
