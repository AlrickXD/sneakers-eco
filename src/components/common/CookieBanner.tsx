'use client'

import { useState, useEffect } from 'react'

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('pere2chaussures-cookies-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('pere2chaussures-cookies-consent', 'accepted')
    setShowBanner(false)
    // Ici vous pourriez activer Google Analytics ou autres outils
    console.log('Cookies acceptés - Analytics activés')
  }

  const rejectCookies = () => {
    localStorage.setItem('pere2chaussures-cookies-consent', 'rejected')
    setShowBanner(false)
    console.log('Cookies rejetés - Analytics désactivés')
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-3 sm:p-4 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience.{' '}
              <span className="hidden sm:inline">
                En continuant à naviguer, vous acceptez notre utilisation des cookies.{' '}
              </span>
              <a 
                href="/legal/privacy" 
                className="underline hover:no-underline whitespace-nowrap"
              >
                En savoir plus
              </a>
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={rejectCookies}
              className="px-3 py-2 sm:px-4 text-xs sm:text-sm border border-white text-white rounded-lg hover:bg-white hover:text-black transition-colors flex-1 sm:flex-initial"
            >
              Refuser
            </button>
            <button
              onClick={acceptCookies}
              className="px-3 py-2 sm:px-4 text-xs sm:text-sm bg-white text-black rounded-lg hover:bg-gray-200 transition-colors flex-1 sm:flex-initial"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
