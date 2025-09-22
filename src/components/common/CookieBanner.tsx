'use client'

import { useState, useEffect } from 'react'

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('pere2chaussures-cookies-consent')
    if (!consent) {
      setShowBanner(true)
      // Petite animation d'entrée
      setTimeout(() => setIsVisible(true), 100)
    }
  }, [])

  const acceptCookies = () => {
    setIsVisible(false)
    setTimeout(() => {
      localStorage.setItem('pere2chaussures-cookies-consent', 'accepted')
      setShowBanner(false)
      // Ici vous pourriez activer Google Analytics ou autres outils
      console.log('Cookies acceptés - Analytics activés')
    }, 300)
  }

  const rejectCookies = () => {
    setIsVisible(false)
    setTimeout(() => {
      localStorage.setItem('pere2chaussures-cookies-consent', 'rejected')
      setShowBanner(false)
      console.log('Cookies rejetés - Analytics désactivés')
    }, 300)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      rejectCookies()
    }
  }

  if (!showBanner) {
    return null
  }

  return (
    <>
      {/* Arrière-plan transparent avec effet de flou */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleBackdropClick}
      >
        {/* Pop-up centré */}
        <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          {/* Header avec icône */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Des données pour optimiser ton expérience
            </h3>
          </div>

          {/* Contenu */}
          <div className="px-6 pb-6">
            <p className="text-gray-600 text-sm leading-relaxed mb-6 text-center">
              Pour améliorer ton expérience sur notre plateforme et te montrer des infos plus pertinentes, nous utilisons des cookies et technologies similaires pour analyser l'utilisation du site et personnaliser ton expérience d'achat.
            </p>

            {/* Sections détaillées */}
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Strictement nécessaires (toujours activés)
                </h4>
                <p className="text-xs text-gray-500 ml-4">
                  Permet aux fonctionnalités principales de mémoriser la langue, ton emplacement et le contenu de ton panier. Assure aussi la sécurité, la gestion du réseau et l'accessibilité.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Performances et analyses
                </h4>
                <p className="text-xs text-gray-500 ml-4">
                  Autorise l'utilisation des données comportementales pour optimiser les performances, étudier tes interactions avec notre site et améliorer l'expérience Père2Chaussures.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-6 text-center">
              Tu peux modifier tes préférences à tout moment en consultant notre politique de confidentialité ou en nous contactant directement.
            </p>

            <p className="text-xs text-gray-500 mb-6 text-center">
              Pour en savoir plus, consulte notre{' '}
              <a 
                href="/legal/privacy" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Politique de confidentialité et de gestion des cookies
              </a>.
            </p>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <button
                onClick={rejectCookies}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                Tout refuser
              </button>
              <button
                onClick={acceptCookies}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
              >
                Tout accepter
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}