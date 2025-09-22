'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { OrderWithItems } from '@/types/database'
import Link from 'next/link'
import { CheckCircle, Package, Truck } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()
  const { showSuccessToast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [error, setError] = useState('')
  const hasCleared = useRef(false)

  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!sessionId || !user) {
        setLoading(false)
        return
      }

      try {
        // Récupérer la commande la plus récente de l'utilisateur
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product_variants (*)
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })
          .limit(1)

        if (orderError) {
          console.error('Erreur lors du chargement de la commande:', orderError)
          setError('Impossible de charger les détails de la commande')
        } else if (orderData && orderData.length > 0) {
          setOrder(orderData[0] as OrderWithItems)
        }

        // Vider le panier après un achat réussi (une seule fois)
        if (!hasCleared.current) {
          clearCart()
          hasCleared.current = true
          
          // Notification de succès
          setTimeout(() => {
            showSuccessToast(
              'Commande confirmée !', 
              'Votre paiement a été traité avec succès'
            )
          }, 500)
        }

      } catch (error) {
        console.error('Erreur:', error)
        setError('Erreur lors du chargement des détails')
      } finally {
        setLoading(false)
      }
    }

    loadOrderDetails()
  }, [sessionId, user, clearCart, showSuccessToast])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Icône de succès */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 bg-green-100 rounded-full mb-8">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Message de succès */}
          <h1 className="text-4xl font-bold text-black mb-4">
            Commande confirmée !
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Merci pour votre achat. Votre commande a été traitée avec succès.
          </p>

          {/* Détails de la commande */}
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <p className="text-red-600 text-sm">{error}</p>
              <p className="text-gray-600 text-sm mt-2">
                Numéro de session : <span className="font-mono">{sessionId}</span>
              </p>
            </div>
          ) : order ? (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Commande</p>
                  <p className="font-semibold text-black">#{order.id.slice(-8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-bold text-black text-lg">{order.total_eur.toFixed(2)} €</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                    <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-black text-sm truncate">
                        {item.product_variants.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        Taille {item.product_variants.taille} • {item.product_variants.etat.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-black text-sm">
                        {item.quantity}x {item.unit_price_eur.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : sessionId ? (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">Commande en cours de traitement...</p>
              <p className="font-mono text-xs text-gray-500">Session : {sessionId}</p>
            </div>
          ) : null}

          {/* Étapes suivantes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">Préparation</h3>
              <p className="text-gray-600 text-sm">
                Votre commande est en cours de préparation dans nos entrepôts
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">Expédition</h3>
              <p className="text-gray-600 text-sm">
                Livraison gratuite sous 3-5 jours ouvrés
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-black mb-2">Réception</h3>
              <p className="text-gray-600 text-sm">
                Vous recevrez un email de confirmation avec le suivi
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/account"
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Voir mes commandes
            </Link>
            <Link
              href="/products"
              className="border border-black text-black px-8 py-3 rounded-lg font-semibold hover:bg-black hover:text-white transition-colors"
            >
              Continuer mes achats
            </Link>
          </div>

          {/* Message éco-responsable */}
          <div className="mt-12 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-800 mb-2">
              🌱 Merci pour votre engagement éco-responsable !
            </h3>
            <p className="text-green-700 text-sm">
              En choisissant Père2Chaussures, vous contribuez à réduire l&apos;impact 
              environnemental de l&apos;industrie de la mode. Chaque achat compte !
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
    </div>}>
      <SuccessContent />
    </Suspense>
  )
}
