import { useState, useCallback } from 'react'

export function useCartAnimation() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  const triggerAddAnimation = useCallback(() => {
    setIsAnimating(true)
    setShowNotification(true)
    
    // Arrêter l'animation du bouton après 1 seconde
    setTimeout(() => {
      setIsAnimating(false)
    }, 1000)
  }, [])

  const hideNotification = useCallback(() => {
    setShowNotification(false)
  }, [])

  return {
    isAnimating,
    showNotification,
    triggerAddAnimation,
    hideNotification
  }
}


