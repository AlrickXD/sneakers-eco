'use client'

import { ReactNode } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Shield, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface AdminGuardProps {
  children: ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, isLoggedIn, isAuthLoading } = useAdmin()

  // Afficher le loading pendant que l'auth se charge
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Vérification des permissions...</p>
        </div>
      </div>
    )
  }

  // Si pas connecté, rediriger vers la page de connexion
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Connexion requise</h1>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour accéder à l'administration.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  // Si connecté mais pas admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-6">Vous devez être administrateur pour accéder à cette page.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>
}
