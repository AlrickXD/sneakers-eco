'use client'

import { useEffect, useState } from 'react'
import { useAdmin, AdminUser } from '@/hooks/useAdmin'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { supabase } from '@/lib/supabase'
import { 
  User, 
  Crown, 
  ShoppingBag, 
  Edit, 
  Trash2, 
  Mail,
  Calendar,
  Search,
  Filter,
  UserPlus,
  AlertTriangle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function AdminUsersPage() {
  const { getAllUsers, changeUserRole, deleteUser, loading, error } = useAdmin()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [updatingUser, setUpdatingUser] = useState<string | null>(null)
  const [deletingUser, setDeletingUser] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'vendeur' | 'admin'>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newVendorData, setNewVendorData] = useState({
    email: '',
    password: '',
    displayName: ''
  })
  const [creatingVendor, setCreatingVendor] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const loadUsers = async () => {
    const data = await getAllUsers()
    setUsers(data)
  }

  const filterUsers = () => {
    let filtered = users

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtrer par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleRoleChange = async (userId: string, newRole: 'client' | 'vendeur' | 'admin') => {
    setUpdatingUser(userId)
    const success = await changeUserRole(userId, newRole)
    
    if (success) {
      // Mettre à jour localement
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
    }
    
    setUpdatingUser(null)
  }

  const handleDeleteUser = async (userId: string) => {
    setDeletingUser(userId)
    const success = await deleteUser(userId)
    
    if (success) {
      // Supprimer localement
      setUsers(users.filter(user => user.id !== userId))
    }
    
    setDeletingUser(null)
    setShowDeleteConfirm(null)
  }

  const handleCreateVendor = async () => {
    if (!newVendorData.email || !newVendorData.password) {
      alert('Email et mot de passe requis')
      return
    }

    setCreatingVendor(true)
    
    try {
      // Créer l'utilisateur via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newVendorData.email,
        password: newVendorData.password,
        options: {
          data: {
            display_name: newVendorData.displayName || newVendorData.email.split('@')[0]
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Mettre à jour le rôle en vendeur
        const success = await changeUserRole(authData.user.id, 'vendeur')
        
        if (success) {
          // Recharger la liste des utilisateurs
          await loadUsers()
          
          // Fermer le modal et réinitialiser
          setShowCreateModal(false)
          setNewVendorData({ email: '', password: '', displayName: '' })
          
          alert('Vendeur créé avec succès!')
        }
      }
    } catch (err) {
      console.error('Erreur lors de la création du vendeur:', err)
      alert('Erreur lors de la création du vendeur')
    } finally {
      setCreatingVendor(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 'vendeur':
        return <ShoppingBag className="h-4 w-4 text-blue-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      vendeur: 'bg-blue-100 text-blue-800 border-blue-200',
      client: 'bg-gray-100 text-gray-800 border-gray-200'
    }

    const labels = {
      admin: 'Administrateur',
      vendeur: 'Vendeur',
      client: 'Client'
    }

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${styles[role as keyof typeof styles]}`}>
        {getRoleIcon(role)}
        {labels[role as keyof typeof labels] || role}
      </span>
    )
  }

  if (loading && users.length === 0) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Chargement des utilisateurs...</p>
          </div>
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
                👥 Gestion des utilisateurs
              </h1>
              <p className="text-gray-600">
                Gérer les rôles, permissions et utilisateurs de la plateforme
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Créer vendeur
            </button>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadUsers}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-gray-600" />
              <div>
                <div className="text-xl font-bold text-black">
                  {users.filter(u => u.role === 'client').length}
                </div>
                <div className="text-sm text-gray-600">Clients</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
              <div>
                <div className="text-xl font-bold text-black">
                  {users.filter(u => u.role === 'vendeur').length}
                </div>
                <div className="text-sm text-gray-600">Vendeurs</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-yellow-600" />
              <div>
                <div className="text-xl font-bold text-black">
                  {users.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-sm text-gray-600">Administrateurs</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-xl font-bold text-black">{users.length}</div>
                <div className="text-sm text-gray-600">Total</div>
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
                placeholder="Rechercher par email ou nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Filtre par rôle */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'client' | 'vendeur' | 'admin')}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white"
              >
                <option value="all">Tous les rôles</option>
                <option value="client">Clients</option>
                <option value="vendeur">Vendeurs</option>
                <option value="admin">Administrateurs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-black">
              Utilisateurs ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Aucun utilisateur trouvé avec ces critères' 
                  : 'Aucun utilisateur trouvé'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-black">
                              {user.display_name || 'Nom non défini'}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              ID: {user.id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {updatingUser === user.id ? (
                            <div className="flex items-center gap-2">
                              <LoadingSpinner size="sm" />
                              <span className="text-sm text-gray-500">Modification...</span>
                            </div>
                          ) : (
                            <>
                              {/* Menu changement de rôle */}
                              <div className="relative group">
                                <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                                  <Edit className="h-4 w-4" />
                                  Rôle
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                  {['client', 'vendeur', 'admin'].map((role) => (
                                    <button
                                      key={role}
                                      onClick={() => handleRoleChange(user.id, role as 'client' | 'vendeur' | 'admin')}
                                      disabled={user.role === role}
                                      className={`block w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg last:rounded-b-lg ${
                                        user.role === role ? 'bg-gray-50 font-medium text-black' : ''
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {getRoleIcon(role)}
                                        {role === 'admin' ? 'Administrateur' : 
                                         role === 'vendeur' ? 'Vendeur' : 'Client'}
                                        {user.role === role && <span className="text-xs text-gray-500">(actuel)</span>}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Bouton suppression (sauf pour les admins) */}
                              {user.role !== 'admin' && (
                                <>
                                  {deletingUser === user.id ? (
                                    <div className="flex items-center gap-2">
                                      <LoadingSpinner size="sm" />
                                      <span className="text-sm text-red-500">Suppression...</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setShowDeleteConfirm(user.id)}
                                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Supprimer
                                    </button>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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
                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de création de vendeur */}
        {showCreateModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <UserPlus className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-black">Créer un nouveau vendeur</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newVendorData.email}
                    onChange={(e) => setNewVendorData({...newVendorData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="vendeur@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    value={newVendorData.password}
                    onChange={(e) => setNewVendorData({...newVendorData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Minimum 6 caractères"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'affichage (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newVendorData.displayName}
                    onChange={(e) => setNewVendorData({...newVendorData, displayName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom du vendeur"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewVendorData({ email: '', password: '', displayName: '' })
                  }}
                  disabled={creatingVendor}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateVendor}
                  disabled={creatingVendor || !newVendorData.email || !newVendorData.password}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {creatingVendor ? <LoadingSpinner size="sm" /> : <UserPlus className="h-4 w-4" />}
                  {creatingVendor ? 'Création...' : 'Créer vendeur'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Informations importantes */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <User className="h-5 w-5" />
              Rôles et permissions
            </h3>
            <div className="text-blue-700 text-sm space-y-1">
              <p>• <strong>Clients :</strong> Parcourir et acheter des produits</p>
              <p>• <strong>Vendeurs :</strong> Gérer les produits et voir les commandes</p>
              <p>• <strong>Administrateurs :</strong> Accès complet à toutes les fonctionnalités</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Sécurité
            </h3>
            <div className="text-yellow-700 text-sm space-y-1">
              <p>• Les changements de rôle prennent effet immédiatement</p>
              <p>• Les administrateurs ne peuvent pas être supprimés</p>
              <p>• La suppression d'un utilisateur est définitive</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </AdminGuard>
  )
}
