// Types TypeScript pour la base de données

export interface Profile {
  id: string
  role: 'client' | 'vendeur' | 'admin'
  display_name?: string
  created_at: string
}

export interface Product {
  product_id: string
  name: string
  categorie: string
  images?: string
  description?: string
  seller_id?: string
}

export interface ProductVariant {
  sku: string
  product_id: string
  name: string
  brand?: string
  etat: 'NEUF' | 'SECONDE_MAIN'
  taille: number
  categorie: string
  prix_eur: number
  stock: number
  images?: string
  couleur?: string
  description?: string
  seller_id?: string
  created_at?: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'paid' | 'canceled' | 'fulfilled'
  total_eur: number
  needs_label?: boolean
  shipping_name?: string
  shipping_address_line1?: string
  shipping_address_line2?: string
  shipping_city?: string
  shipping_postal_code?: string
  shipping_country?: string
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  sku: string
  quantity: number
  unit_price_eur: number
}

// Types pour les requêtes avec relations
export interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    product_variants: ProductVariant
  })[]
}

export interface ProductWithVariants extends Product {
  product_variants: ProductVariant[]
}

// Types pour le panier
export interface CartItem {
  sku: string
  name: string
  price: number
  image?: string
  quantity: number
  size: number
  condition: 'NEUF' | 'SECONDE_MAIN'
}

// Types pour les statistiques admin
export interface AdminStats {
  total_orders: number
  total_revenue: number
  low_stock_items: number
  total_clients: number
  total_sellers: number
}
