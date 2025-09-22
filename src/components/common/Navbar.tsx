'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Search, ShoppingCart, User, Menu, X, LogIn, UserPlus, HelpCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { user, profile, signOut } = useAuth()
  const { itemCount } = useCart()
  const { showSuccessToast } = useToast()
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?query=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleSignOut = async () => {
    if (isSigningOut) return
    
    setIsSigningOut(true)
    try {
      await signOut()
      showSuccessToast('Déconnexion réussie', 'Vous êtes maintenant déconnecté')
      // Attendre un petit délai pour que le toast s'affiche avant la redirection
      setTimeout(() => {
        router.push('/')
      }, 100)
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      setIsSigningOut(false) // Remettre à false seulement en cas d'erreur
    }
    // Ne pas remettre setIsSigningOut(false) ici car on va être redirigé
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="P2C" 
              className="h-12 w-12 object-contain"
            />
          </Link>

          {/* Desktop Navigation - Masqué pour vendeurs et admins */}
          {profile?.role !== 'vendeur' && profile?.role !== 'admin' && (
            <div className="hidden md:flex items-center space-x-8">
              {/* Catégories en gras */}
              <Link href="/products?category=homme" className="text-black hover:text-gray-600 font-bold text-sm tracking-wide">
                HOMME
              </Link>
              <Link href="/products?category=femme" className="text-black hover:text-gray-600 font-bold text-sm tracking-wide">
                FEMME
              </Link>
              <Link href="/products?category=enfant" className="text-black hover:text-gray-600 font-bold text-sm tracking-wide">
                ENFANT
              </Link>
              
              {/* Séparateur */}
              <div className="h-6 w-px bg-gray-300"></div>
              
              {/* États */}
              <Link href="/products?condition=new" className="text-gray-600 hover:text-black text-sm">
                NEUF
              </Link>
              <Link href="/products?condition=secondhand" className="text-green-600 hover:text-green-700 text-sm">
                SECONDE MAIN
              </Link>
            </div>
          )}

          {/* Search, User, Cart */}
          <div className="flex items-center space-x-4">
            {/* Search - Masqué pour vendeurs et admins */}
            {profile?.role !== 'vendeur' && profile?.role !== 'admin' && (
              <div className="hidden md:block">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </form>
              </div>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <User className="h-6 w-6 text-black" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <Link 
                    href="/account" 
                    className="block px-4 py-2 text-black hover:bg-gray-50"
                  >
                    Mon compte
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="block px-4 py-2 text-black hover:bg-gray-50"
                    >
                      Administration
                    </Link>
                  )}
                  {profile?.role === 'vendeur' && (
                    <Link 
                      href="/seller" 
                      className="block px-4 py-2 text-black hover:bg-gray-50"
                    >
                      Espace vendeur
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="block w-full text-left px-4 py-2 text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSigningOut ? 'Déconnexion...' : 'Se déconnecter'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <User className="h-6 w-6 text-black" />
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="py-2">
                    <Link 
                      href="/login" 
                      className="flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-50 transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Se connecter</span>
                    </Link>
                    <Link 
                      href="/signup" 
                      className="flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-50 transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>S'inscrire</span>
                    </Link>
                    <div className="border-t border-gray-100 my-2"></div>
                    <Link 
                      href="/contact" 
                      className="flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span>Aide & Contact</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Cart - Masqué pour vendeurs et admins */}
            {profile?.role !== 'vendeur' && profile?.role !== 'admin' && (
              <Link href="/cart" className="relative p-2 group">
                <ShoppingCart className="h-6 w-6 text-black group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-black" />
              ) : (
                <Menu className="h-6 w-6 text-black" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
              <div className="px-4 py-4 space-y-2">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </form>

                {/* Mobile Navigation Links */}
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Catégories</div>
                  <Link 
                    href="/products?category=homme" 
                    className="block py-2 text-black font-bold text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    HOMME
                  </Link>
                  <Link 
                    href="/products?category=femme" 
                    className="block py-2 text-black font-bold text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    FEMME
                  </Link>
                  <Link 
                    href="/products?category=enfant" 
                    className="block py-2 text-black font-bold text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ENFANT
                  </Link>
                </div>

                <div className="border-t border-gray-200 my-3"></div>

                <div className="space-y-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">État</div>
                  <Link 
                    href="/products?condition=new" 
                    className="block py-2 text-gray-600 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    NEUF
                  </Link>
                  <Link 
                    href="/products?condition=secondhand" 
                    className="block py-2 text-green-600 text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    SECONDE MAIN
                  </Link>
                </div>

                <div className="border-t border-gray-200 my-2"></div>

                {/* User actions */}
                {user ? (
                  <>
                    <Link 
                      href="/account" 
                      className="block py-2 text-black font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mon compte
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        className="block py-2 text-black font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Administration
                      </Link>
                    )}
                    {profile?.role === 'vendeur' && (
                      <Link 
                        href="/seller" 
                        className="block py-2 text-black font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Espace vendeur
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="block w-full text-left py-2 text-black font-medium disabled:opacity-50"
                    >
                      {isSigningOut ? 'Déconnexion...' : 'Se déconnecter'}
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="block py-2 text-black font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Se connecter
                    </Link>
                    <Link 
                      href="/signup" 
                      className="block py-2 text-black font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      S'inscrire
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link 
                      href="/contact" 
                      className="block py-2 text-black font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Aide & Contact
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}