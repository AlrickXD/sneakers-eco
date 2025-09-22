'use client'

import React, { createContext, useContext, useState } from 'react'
import { Toast, ToastProps } from '@/components/common/Toast'

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void
  showCartToast: (productName: string, size: number, condition: string) => void
  showSuccessToast: (title: string, message?: string) => void
  showErrorToast: (title: string, message?: string) => void
  showInfoToast: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substring(2, 15)
    const newToast = {
      ...toast,
      id,
      onClose: removeToast
    }
    
    setToasts(prev => [...prev, newToast])
  }

  const showCartToast = (productName: string, size: number, condition: string) => {
    showToast({
      type: 'success',
      title: 'Ajouté au panier !',
      message: `${productName} - Taille ${size} (${condition.replace('_', ' ')})`,
      duration: 3000
    })
  }

  const showSuccessToast = (title: string, message?: string) => {
    showToast({
      type: 'success',
      title,
      message,
      duration: 4000
    })
  }

  const showErrorToast = (title: string, message?: string) => {
    showToast({
      type: 'error',
      title,
      message,
      duration: 5000
    })
  }

  const showInfoToast = (title: string, message?: string) => {
    showToast({
      type: 'info',
      title,
      message,
      duration: 4000
    })
  }

  const value = {
    showToast,
    showCartToast,
    showSuccessToast,
    showErrorToast,
    showInfoToast
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Conteneur des toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}


