'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'
import { checkDatabaseSetup, getSetupInstructions } from '@/utils/setupCheck'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: string }>
  signUp: (email: string, password: string, displayName?: string, role?: 'client' | 'vendeur') => Promise<{ error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Fonction pour charger le profil utilisateur
  const loadProfile = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Si le profil n'existe pas, le créer
        if (error.code === 'PGRST116') {
          console.log('Profil non trouvé, création en cours...')
          // Récupérer les métadonnées utilisateur pour obtenir le rôle
          const { data: userData } = await supabase.auth.getUser()
          const userRole = userData.user?.user_metadata?.role
          return await createProfile(userId, userEmail, userRole)
        }
        console.error('Erreur lors du chargement du profil:', error)
        return null
      }

      return data as Profile
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      return null
    }
  }

  // Fonction pour créer un profil utilisateur
  const createProfile = async (userId: string, userEmail?: string, userRole?: string) => {
    try {
      // Récupérer les informations utilisateur pour les utilisateurs OAuth
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      
      // Utiliser les informations du profil Google si disponibles
      const displayName = user?.user_metadata?.full_name || 
                         user?.user_metadata?.name || 
                         userEmail?.split('@')[0] || 
                         'Utilisateur'

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: userRole || 'client',
          display_name: displayName
        })
        .select()
        .single()

      if (error) {
        console.error('Erreur lors de la création du profil:', error)
        return null
      }

      console.log('Profil créé avec succès:', displayName)
      return data as Profile
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error)
      return null
    }
  }

  // Fonction pour rafraîchir le profil
  const refreshProfile = async () => {
    if (user) {
      const profileData = await loadProfile(user.id, user.email || undefined)
      setProfile(profileData)
    }
  }

  // Fonction de connexion
  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error.message }
      }

      // Configurer la persistance locale si "Rester connecté" est activé
      if (rememberMe) {
        localStorage.setItem('pere2chaussures-remember-me', 'true')
      } else {
        localStorage.removeItem('pere2chaussures-remember-me')
      }

      return {}
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion'
      return { error: errorMessage }
    }
  }

  // Fonction d'inscription
  const signUp = async (email: string, password: string, displayName?: string, role: 'client' | 'vendeur' = 'client') => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            role: role
          }
        }
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription'
      return { error: errorMessage }
    }
  }

  // Fonction de déconnexion
  const signOut = async () => {
    setLoading(true) // Activer le loading pendant la déconnexion
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      // Le loading sera géré par l'effet onAuthStateChange
      // Ne pas remettre setLoading(false) ici pour éviter les conflits
    }
  }

  // Vérifier si l'email est dans la liste des admins
  const checkAdminEmail = (email: string): boolean => {
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []
    return adminEmails.includes(email)
  }

  // Promouvoir automatiquement les admins
  const promoteToAdmin = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId)
    } catch (error) {
      console.error('Erreur lors de la promotion admin:', error)
    }
  }

  // Vérifier la configuration de la base de données (une seule fois)
  useEffect(() => {
    let hasChecked = false
    
    const checkSetup = async () => {
      if (hasChecked) return
      hasChecked = true
      
      try {
        const setupResult = await checkDatabaseSetup()
        if (!setupResult.isSetup) {
          console.error('❌ Configuration de la base de données incomplète:')
          setupResult.errors.forEach(error => console.error('  -', error))
          console.log(getSetupInstructions())
        }
        if (setupResult.warnings.length > 0) {
          console.warn('⚠️ Avertissements:')
          setupResult.warnings.forEach(warning => console.warn('  -', warning))
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la configuration:', error)
      }
    }
    
    // Délai pour éviter les conflits avec l'initialisation
    const timer = setTimeout(checkSetup, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Écouter les changements d'authentification
  useEffect(() => {
    let isMounted = true

    const handleAuthUser = async (user: User | null) => {
      if (!isMounted) return

      if (user) {
        const profileData = await loadProfile(user.id, user.email || undefined)
        if (!isMounted) return

        setProfile(profileData)
        
        // Vérifier si l'utilisateur doit être promu admin (une seule fois)
        if (profileData && profileData.role !== 'admin' && user.email && checkAdminEmail(user.email)) {
          await promoteToAdmin(user.id)
          if (!isMounted) return
          
          // Recharger le profil après promotion
          const updatedProfile = await loadProfile(user.id, user.email || undefined)
          if (isMounted) {
            setProfile(updatedProfile)
          }
        }
      } else {
        setProfile(null)
      }
      
      if (isMounted) {
        setLoading(false)
      }
    }

    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      
      setSession(session)
      setUser(session?.user ?? null)
      handleAuthUser(session?.user ?? null)
    })

    // Écouter les changements d'état d'authentification
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      setSession(session)
      setUser(session?.user ?? null)
      await handleAuthUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, []) // Pas de dépendances pour éviter les re-renders

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
