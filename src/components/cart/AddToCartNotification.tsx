'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle, ShoppingCart, X } from 'lucide-react'
import { cleanImageUrl } from '@/utils/imageUtils'

interface AddToCartNotificationProps {
  isVisible: boolean
  productName: string
  productImage?: string
  size: number
  condition: string
  price: number
  onClose: () => void
}

export function AddToCartNotification({
  isVisible,
  productName,
  productImage,
  size,
  condition,
  price,
  onClose
}: AddToCartNotificationProps) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      // Auto-fermeture après 4 secondes
      const timer = setTimeout(() => {
        onClose()
      }, 4000)
      return () => clearTimeout(timer)
    } else {
      // Délai pour l'animation de sortie
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!shouldRender) return null

  return (
    <div
      className={`
        fixed top-20 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4">
        {/* En-tête avec icône de succès */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-black">Ajouté au panier !</h3>
          <button
            onClick={onClose}
            className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Détails du produit */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {cleanImageUrl(productImage) ? (
              <Image
                src={cleanImageUrl(productImage)!}
                alt={productName}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-black text-sm truncate">
              {productName}
            </h4>
            <div className="text-xs text-gray-600">
              Taille {size} • {condition.replace('_', ' ')}
            </div>
            <div className="text-sm font-semibold text-black">
              {price.toFixed(2)} €
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-black py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Continuer
          </button>
          <Link
            href="/cart"
            className="flex-1 bg-black text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors text-center"
          >
            Voir le panier
          </Link>
        </div>
      </div>
    </div>
  )
}


