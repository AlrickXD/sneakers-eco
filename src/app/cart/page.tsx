'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { Minus, Plus, Trash2, ShoppingBag, Eye } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cleanImageUrl } from '@/utils/imageUtils'

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsLabel, setNeedsLabel] = useState(false)

  const handleCheckout = async () => {
    // Vérifier si l'utilisateur est un vendeur ou admin
    if (profile?.role === 'vendeur' || profile?.role === 'admin') {
      setError('En tant que vendeur/administrateur, vous ne pouvez pas effectuer d\'achats sur cette plateforme.')
      return
    }

    if (!user) {
      // Rediriger vers la page de connexion
      window.location.href = '/login?redirect=/cart'
      return
    }

    if (items.length === 0) return

    setLoading(true)
    setError('')

    try {
      const checkoutItems = items.map(item => ({
        sku: item.sku,
        quantity: item.quantity
      }))

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: checkoutItems,
          userId: user.id,
          needsLabel
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session de paiement')
      }

      // Rediriger vers Stripe Checkout
      window.location.href = data.url
    } catch (error: unknown) {
      console.error('Erreur checkout:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'; setError(errorMessage)
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-black mb-4">
              Votre panier est vide
            </h1>
            <p className="text-gray-600 mb-8">
              Découvrez notre sélection de chaussures et trouvez votre paire idéale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products?condition=new"
                className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Chaussures neuves
              </Link>
              <Link
                href="/products?condition=secondhand"
                className="border border-black text-black px-8 py-3 rounded-lg font-medium hover:bg-black hover:text-white transition-colors"
              >
                Seconde main
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-black">Mon panier</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Vider le panier
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles du panier */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.sku}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                >
                  {/* Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {cleanImageUrl(item.image) ? (
                      <Image
                        src={cleanImageUrl(item.image)!}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Pas d&apos;image
                      </div>
                    )}
                  </div>

                  {/* Informations */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-black truncate">{item.name}</h3>
                    <div className="text-sm text-gray-600">
                      <div>Taille: {item.size}</div>
                      <div>Condition: {item.condition.replace('_', ' ')}</div>
                    </div>
                    <div className="font-semibold text-black mt-1">
                      {item.price.toFixed(2)} €
                    </div>
                  </div>

                  {/* Contrôles quantité */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:border-black transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:border-black transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Prix total */}
                  <div className="text-right">
                    <div className="font-semibold text-black">
                      {(item.price * item.quantity).toFixed(2)} €
                    </div>
                  </div>

                  {/* Supprimer */}
                  <button
                    onClick={() => removeItem(item.sku)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Résumé de commande */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-black mb-4">
                Résumé de commande
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{total.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium text-green-600">Gratuite</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-black">Total</span>
                    <span className="text-lg font-bold text-black">{total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-blue-700 text-sm">
                    Vous devez être connecté pour passer commande.
                  </p>
                </div>
              )}

              {(profile?.role === 'vendeur' || profile?.role === 'admin') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">
                      Mode consultation {profile?.role === 'admin' ? 'administrateur' : 'vendeur'}
                    </span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    En tant que {profile?.role === 'admin' ? 'administrateur' : 'vendeur'}, vous pouvez consulter votre panier mais vous ne pouvez pas effectuer d&apos;achats.
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    Votre panier contient {items.length} article{items.length !== 1 ? 's' : ''} pour un total de {total.toFixed(2)} €
                  </p>
                </div>
              )}

              {(profile?.role === 'vendeur' || profile?.role === 'admin') ? (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm mb-2">
                    Achat non autorisé pour les {profile?.role === 'admin' ? 'administrateurs' : 'vendeurs'}
                  </p>
                  <Link
                    href="/products"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Continuer mes achats →
                  </Link>
                </div>
              ) : (
                <>
                  {/* Case à cocher éco-responsable */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg shadow-sm">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        id="needsLabel"
                        checked={needsLabel}
                        onChange={(e) => setNeedsLabel(e.target.checked)}
                        className="mt-1 h-5 w-5 text-green-600 border-green-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <label htmlFor="needsLabel" className="text-base font-semibold text-green-800 cursor-pointer block mb-1">
                          🌱 Option éco-responsable
                        </label>
                        <p className="text-sm text-green-700 cursor-pointer">
                          Renvoyer une ancienne paire de chaussures et obtenez un code de réduction !
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    disabled={loading || items.length === 0}
                    className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Préparation...' : user ? 'Passer commande' : 'Se connecter pour commander'}
                  </button>
                </>
              )}

              <div className="mt-4 text-center">
                <Link
                  href="/products"
                  className="text-black font-medium hover:underline"
                >
                  ← Continuer mes achats
                </Link>
              </div>

              {/* Informations de sécurité */}
              <div className="mt-6 text-center text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span>🔒</span>
                  <span>Paiement sécurisé par Stripe</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>🚚</span>
                  <span>Livraison gratuite</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
