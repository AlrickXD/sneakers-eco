'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface ModernSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  allowOther?: boolean
  onOtherValue?: (value: string) => void
  className?: string
}

export function ModernSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Sélectionner...", 
  label,
  required = false,
  allowOther = false,
  onOtherValue,
  className = ""
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [otherValue, setOtherValue] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setShowOtherInput(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    if (optionValue === 'other' && allowOther) {
      setShowOtherInput(true)
      return
    }
    
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
    setShowOtherInput(false)
  }

  const handleOtherSubmit = () => {
    if (otherValue.trim() && onOtherValue) {
      onOtherValue(otherValue.trim())
      onChange(otherValue.trim())
      setIsOpen(false)
      setShowOtherInput(false)
      setOtherValue('')
    }
  }

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-black mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-transparent transition-colors hover:border-gray-400"
        >
          <div className="flex items-center justify-between">
            <span className={selectedOption ? 'text-black' : 'text-gray-500'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto">
              {showOtherInput ? (
                <div className="p-3 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Saisir la valeur..."
                    value={otherValue}
                    onChange={(e) => setOtherValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleOtherSubmit()
                      }
                      if (e.key === 'Escape') {
                        setShowOtherInput(false)
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-transparent"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleOtherSubmit}
                      className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800"
                    >
                      Valider
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOtherInput(false)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <span className="text-black">{option.label}</span>
                      {value === option.value && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </button>
                  ))}
                  
                  {allowOther && (
                    <button
                      type="button"
                      onClick={() => handleSelect('other')}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-600 border-t border-gray-200"
                    >
                      Autre (saisir manuellement)
                    </button>
                  )}
                  
                  {filteredOptions.length === 0 && !allowOther && (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      Aucun résultat trouvé
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
