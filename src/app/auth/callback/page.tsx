'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Récupérer la session après l'authentification OAuth
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error)
          router.push('/login?error=callback_error')
          return
        }

        if (session?.user) {
          // Récupérer le profil de l'utilisateur
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          // Redirection selon le rôle
          if (profile?.role === 'vendeur') {
            router.push('/seller')
          } else if (profile?.role === 'admin') {
            router.push('/admin')
          } else {
            router.push('/')
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Erreur lors du callback auth:', error)
        router.push('/login?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Finalisation de la connexion...</p>
      </div>
    </div>
  )
}



