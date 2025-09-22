'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { CartItem } from '@/types/database'
import { useAuth } from './AuthContext'

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (sku: string) => void
  updateQuantity: (sku: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { profile } = useAuth()

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    const savedCart = localStorage.getItem('pere2chaussures-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error)
      }
    }
  }, [])

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('pere2chaussures-cart', JSON.stringify(items))
  }, [items])

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    // Vérifier si l'utilisateur est un vendeur ou admin
    if (profile?.role === 'vendeur' || profile?.role === 'admin') {
      console.log('Vendeur/Admin détecté - ajout au panier bloqué dans le contexte')
      return
    }

    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.sku === newItem.sku)

      if (existingItem) {
        return currentItems.map(item =>
          item.sku === newItem.sku
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...currentItems, { ...newItem, quantity: 1 }]
      }
    })
  }, [profile?.role])

  const removeItem = useCallback((sku: string) => {
    setItems(currentItems => currentItems.filter(item => item.sku !== sku))
  }, [])

  const updateQuantity = useCallback((sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(sku)
      return
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.sku === sku ? { ...item, quantity } : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
