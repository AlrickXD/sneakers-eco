'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

function SignUpContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'client' | 'vendeur'>('client')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { signUp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'vendeur') {
      setRole('vendeur')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!email || !password) {
      setError('Veuillez remplir tous les champs obligatoires')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setLoading(false)
      return
    }

    const { error: signUpError } = await signUp(email, password, displayName, role)
    
    if (signUpError) {
      setError(signUpError)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        setError(error.message)
      }
    } catch (error: any) {
      setError('Erreur lors de l\'inscription avec Google')
    } finally {
      setGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white py-8 sm:py-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-4 sm:p-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Inscription réussie !
              </h2>
              <p className="text-green-700">
                Vérifiez votre email pour confirmer votre compte.
                Vous allez être redirigé vers la page de connexion...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white py-8 sm:py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 p-4 sm:p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black">Inscription</h1>
          <p className="mt-2 text-gray-600">
            Père 2 Chaussure : la responsabilité aux pieds !
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-black mb-2">
              Nom d&apos;affichage (optionnel)
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Votre nom"
            />
          </div>

          {/* Indicateur du type de compte - Seulement pour vendeur */}
          {role === 'vendeur' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏪</span>
                <div>
                  <h3 className="font-semibold text-black">
                    Inscription Vendeur
                  </h3>
                  <p className="text-sm text-gray-600">
                    Idéal pour vendre vos chaussures neuves ou d\'occasion
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              Mot de passe * (min. 8 caractères)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Création du compte...' : 'S\'inscrire'}
          </button>
        </form>

        {/* Séparateur */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou</span>
          </div>
        </div>

        {/* Inscription Google */}
        <button
          onClick={handleGoogleSignUp}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Image 
            src="/g.png" 
            alt="Google" 
            width={20} 
            height={20} 
            className="h-5 w-5"
          />
          {googleLoading ? 'Inscription Google...' : 'S\'inscrire avec Google'}
        </button>

          <div className="text-center">
            <p className="text-gray-600">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-black font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="bg-white py-8 sm:py-12"><div className="max-w-md mx-auto px-4 text-center">Chargement...</div></div>}>
      <SignUpContent />
    </Suspense>
  )
}
