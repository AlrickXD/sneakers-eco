'use client'

interface ColorSelectorProps {
  primaryColor: string
  secondaryColor: string
  onPrimaryChange: (color: string) => void
  onSecondaryChange: (color: string) => void
  availableColors: string[]
}

export function ColorSelector({
  primaryColor,
  secondaryColor,
  onPrimaryChange,
  onSecondaryChange,
  availableColors
}: ColorSelectorProps) {
  
  const getColorPreview = (color: string) => {
    const colorMap: Record<string, string> = {
      'NOIR': '#000000',
      'BLANC': '#FFFFFF',
      'ROUGE': '#DC2626',
      'BLEU': '#2563EB',
      'VERT': '#16A34A',
      'JAUNE': '#EAB308',
      'ROSE': '#EC4899',
      'VIOLET': '#7C3AED',
      'ORANGE': '#EA580C',
      'GRIS': '#6B7280',
      'MARRON': '#92400E',
      'BEIGE': '#D2B48C',
      'MULTICOLORE': 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)'
    }
    return colorMap[color] || '#9CA3AF'
  }

  const getFinalColor = () => {
    if (!primaryColor) return ''
    if (!secondaryColor) return primaryColor
    return `${primaryColor} / ${secondaryColor}`
  }

  return (
    <div className="space-y-6">
      {/* Couleur primaire */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Couleur primaire <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {availableColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onPrimaryChange(color)}
              className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                primaryColor === color 
                  ? 'border-black ring-2 ring-black ring-offset-2' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div 
                className="w-full h-8 rounded-md border border-gray-200 mb-2"
                style={{ 
                  background: getColorPreview(color),
                  border: color === 'BLANC' ? '1px solid #e5e7eb' : 'none'
                }}
              />
              <div className="text-xs font-medium text-center text-gray-700">
                {color}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Couleur secondaire */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Couleur secondaire <span className="text-gray-500">(optionnel)</span>
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {/* Option "Aucune" */}
          <button
            type="button"
            onClick={() => onSecondaryChange('')}
            className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
              !secondaryColor 
                ? 'border-black ring-2 ring-black ring-offset-2' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="w-full h-8 rounded-md border border-gray-200 mb-2 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xs">×</span>
            </div>
            <div className="text-xs font-medium text-center text-gray-700">
              Aucune
            </div>
          </button>
          
          {availableColors.filter(color => color !== primaryColor).map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onSecondaryChange(color)}
              className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                secondaryColor === color 
                  ? 'border-black ring-2 ring-black ring-offset-2' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div 
                className="w-full h-8 rounded-md border border-gray-200 mb-2"
                style={{ 
                  background: getColorPreview(color),
                  border: color === 'BLANC' ? '1px solid #e5e7eb' : 'none'
                }}
              />
              <div className="text-xs font-medium text-center text-gray-700">
                {color}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Aperçu du résultat */}
      {primaryColor && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-black mb-2">Couleur finale :</h4>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded border border-gray-300"
                style={{ 
                  background: getColorPreview(primaryColor),
                  border: primaryColor === 'BLANC' ? '1px solid #e5e7eb' : 'none'
                }}
              />
              {secondaryColor && (
                <>
                  <span className="mx-2 text-gray-500">/</span>
                  <div 
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ 
                      background: getColorPreview(secondaryColor),
                      border: secondaryColor === 'BLANC' ? '1px solid #e5e7eb' : 'none'
                    }}
                  />
                </>
              )}
            </div>
            <span className="font-medium text-black">{getFinalColor()}</span>
          </div>
        </div>
      )}
    </div>
  )
}
