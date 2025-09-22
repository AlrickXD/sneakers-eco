'use client'

import { useEffect, useState } from 'react'
import { checkDatabaseSetup } from '@/utils/setupCheck'
import { AlertTriangle, X } from 'lucide-react'

export function SetupAlert() {
  const [errors, setErrors] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [showAlert, setShowAlert] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let isMounted = true
    
    const checkSetup = async () => {
      try {
        const result = await checkDatabaseSetup()
        if (isMounted) {
          setErrors(result.errors)
          setWarnings(result.warnings)
          setShowAlert((result.errors.length > 0 || result.warnings.length > 0) && !dismissed)
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la configuration:', error)
      }
    }
    
    // Délai pour éviter les vérifications trop fréquentes
    const timer = setTimeout(checkSetup, 2000)
    
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [dismissed])

  if (!showAlert || (errors.length === 0 && warnings.length === 0)) {
    return null
  }

  return (
    <div className="fixed top-20 left-4 right-4 z-50 max-w-2xl mx-auto">
      <div className={`rounded-lg p-4 shadow-lg border ${
        errors.length > 0 
          ? 'bg-red-50 border-red-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className={`h-5 w-5 mt-0.5 ${
            errors.length > 0 ? 'text-red-600' : 'text-yellow-600'
          }`} />
          
          <div className="flex-1">
            <h3 className={`font-semibold ${
              errors.length > 0 ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {errors.length > 0 ? 'Configuration requise' : 'Avertissement'}
            </h3>
            
            {errors.length > 0 && (
              <div className="mt-2">
                <p className="text-red-700 text-sm mb-2">
                  L&apos;application nécessite une configuration supplémentaire :
                </p>
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="mt-2">
                <ul className="text-yellow-700 text-sm space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3 text-sm">
              <a 
                href="/SETUP.md" 
                target="_blank" 
                className={`font-medium hover:underline ${
                  errors.length > 0 ? 'text-red-800' : 'text-yellow-800'
                }`}
              >
                Voir les instructions de configuration →
              </a>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className={`p-1 rounded hover:bg-opacity-20 ${
              errors.length > 0 
                ? 'text-red-600 hover:bg-red-600' 
                : 'text-yellow-600 hover:bg-yellow-600'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
