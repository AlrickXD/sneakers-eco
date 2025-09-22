'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const promoMessages = [
  "Livraison gratuite",
  "Retours et échanges gratuits"
]

export function PromoBar() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [shouldShow, setShouldShow] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    // Ne pas afficher la PromoBar pour les vendeurs et admins
    if (profile?.role === 'vendeur' || profile?.role === 'admin') {
      setShouldShow(false)
      return
    }

    setShouldShow(true)

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === promoMessages.length - 1 ? 0 : prevIndex + 1
      )
    }, 4000) // Change toutes les 4 secondes (plus d'espace entre les messages)

    return () => clearInterval(interval)
  }, [profile?.role])

  // Ne pas afficher la PromoBar pour les vendeurs
  if (!shouldShow) {
    return null
  }

  return (
    <div className="text-black py-2" style={{ backgroundColor: '#e5e5e5' }}>
      <div className="text-center text-sm font-medium">
        <div className="h-5 flex items-center justify-center">
          <span className="transition-opacity duration-500 ease-in-out">
            {promoMessages[currentIndex]}
          </span>
        </div>
      </div>
    </div>
  )
}
