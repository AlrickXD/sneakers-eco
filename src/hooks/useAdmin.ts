import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface PlatformStats {
  total_users: number
  total_clients: number
  total_vendeurs: number
  total_admins: number
  total_products: number
  total_orders: number
  total_revenue: number
  pending_orders: number
  paid_orders: number
}

export interface AdminUser {
  id: string
  email: string
  role: 'client' | 'vendeur' | 'admin'
  display_name?: string
  created_at: string
}

export function useAdmin() {
  const { user, profile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLoggedIn = !!user
  const isAdmin = profile?.role === 'admin'
  const isAuthLoading = authLoading

  // Obtenir les statistiques de la plateforme
  const getPlatformStats = async (): Promise<PlatformStats | null> => {
    if (!isAdmin) {
      setError('Accès refusé')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.rpc('get_platform_stats')
      
      if (error) throw error
      
      return data as PlatformStats
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err)
      setError('Erreur lors de la récupération des statistiques')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Obtenir tous les utilisateurs
  const getAllUsers = async (): Promise<AdminUser[]> => {
    if (!isAdmin) {
      setError('Accès refusé')
      return []
    }

    try {
      setLoading(true)
      setError(null)

      // Récupérer seulement les profils pour l'instant
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role, display_name, created_at')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Retourner les profils avec un email générique pour l'instant
      const adminUsers: AdminUser[] = profiles.map(profile => ({
        id: profile.id,
        email: `user-${profile.id.slice(-8)}@example.com`, // Email temporaire
        role: profile.role,
        display_name: profile.display_name,
        created_at: profile.created_at
      }))

      return adminUsers
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err)
      setError('Erreur lors de la récupération des utilisateurs')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Changer le rôle d'un utilisateur
  const changeUserRole = async (
    targetUserId: string, 
    newRole: 'client' | 'vendeur' | 'admin'
  ): Promise<boolean> => {
    if (!isAdmin || !user) {
      setError('Accès refusé')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.rpc('change_user_role', {
        target_user_id: targetUserId,
        new_role: newRole,
        admin_user_id: user.id
      })

      if (error) throw error

      return data
    } catch (err) {
      console.error('Erreur lors du changement de rôle:', err)
      setError('Erreur lors du changement de rôle')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Supprimer un utilisateur
  const deleteUser = async (targetUserId: string): Promise<boolean> => {
    if (!isAdmin || !user) {
      setError('Accès refusé')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.rpc('delete_user_admin', {
        target_user_id: targetUserId,
        admin_user_id: user.id
      })

      if (error) throw error

      return data
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      setError('Erreur lors de la suppression de l\'utilisateur')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Obtenir toutes les commandes avec détails
  const getAllOrders = async () => {
    if (!isAdmin) {
      setError('Accès refusé')
      return []
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id(display_name),
          order_items(
            *,
            product_variants(
              *,
              products(name, images)
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data
    } catch (err) {
      console.error('Erreur lors de la récupération des commandes:', err)
      setError('Erreur lors de la récupération des commandes')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = async (
    orderId: string, 
    status: 'pending' | 'paid' | 'canceled' | 'fulfilled'
  ): Promise<boolean> => {
    if (!isAdmin) {
      setError('Accès refusé')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)

      if (error) throw error

      return true
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la commande:', err)
      setError('Erreur lors de la mise à jour de la commande')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Obtenir tous les produits avec détails vendeur
  const getAllProducts = async () => {
    if (!isAdmin) {
      setError('Accès refusé')
      return []
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles:seller_id(display_name),
          product_variants(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data
    } catch (err) {
      console.error('Erreur lors de la récupération des produits:', err)
      setError('Erreur lors de la récupération des produits')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Supprimer un produit
  const deleteProduct = async (productId: string): Promise<boolean> => {
    if (!isAdmin) {
      setError('Accès refusé')
      return false
    }

    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('product_id', productId)

      if (error) throw error

      return true
    } catch (err) {
      console.error('Erreur lors de la suppression du produit:', err)
      setError('Erreur lors de la suppression du produit')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    isLoggedIn,
    isAdmin,
    isAuthLoading,
    loading,
    error,
    getPlatformStats,
    getAllUsers,
    changeUserRole,
    deleteUser,
    getAllOrders,
    updateOrderStatus,
    getAllProducts,
    deleteProduct
  }
}
