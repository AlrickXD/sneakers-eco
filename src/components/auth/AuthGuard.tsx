'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'client' | 'vendeur' | 'admin'
  allowRoles?: ('client' | 'vendeur' | 'admin')[]
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requiredRole, 
  allowRoles, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // Si pas connecté, rediriger vers la page de connexion
    if (!user) {
      router.push(redirectTo)
      return
    }

    // Si pas de profil, rediriger vers la page de connexion
    if (!profile) {
      router.push(redirectTo)
      return
    }

    // Vérifier les rôles requis
    if (requiredRole && profile.role !== requiredRole) {
      // Vérifier si l'admin a accès
      if (requiredRole !== 'admin' && profile.role === 'admin') {
        // Admin a accès à tout
        return
      }
      router.push('/unauthorized')
      return
    }

    // Vérifier la liste des rôles autorisés
    if (allowRoles && !allowRoles.includes(profile.role)) {
      router.push('/unauthorized')
      return
    }
  }, [user, profile, loading, requiredRole, allowRoles, redirectTo, router])

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Si pas connecté ou pas le bon rôle, afficher un loader pendant la redirection
  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    )
  }

  if (requiredRole && profile.role !== requiredRole && profile.role !== 'admin') {
    return null
  }

  if (allowRoles && !allowRoles.includes(profile.role)) {
    return null
  }

  return <>{children}</>
}


