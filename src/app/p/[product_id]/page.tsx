'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ArrowLeft, ShoppingCart, ChevronDown, Truck, Shield, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { ProductCard } from '@/components/sneakers/ProductCard'
import { AddToCartNotification } from '@/components/cart/AddToCartNotification'
import { useCartAnimation } from '@/hooks/useCartAnimation'
import { getFirstImage, cleanImageUrl } from '@/utils/imageUtils'

interface ProductWithVariants {
  product_id: string
  name: string
  categorie: string
  description?: string
  images?: string
  seller_id?: string
  product_variants: {
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
  }[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.product_id as string
  const [product, setProduct] = useState<ProductWithVariants | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showDescription, setShowDescription] = useState(false)
  const { addItem } = useCart()
  const { profile } = useAuth()
  const { isAnimating, showNotification, triggerAddAnimation, hideNotification } = useCartAnimation()

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  useEffect(() => {
    if (product) {
      loadRelatedProducts()
    }
  }, [product])

  const loadProduct = async () => {
    try {
      console.log('Chargement du produit:', productId)
      
      // Charger le produit principal
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('product_id', productId)
        .single()

      if (productError) {
        console.error('Erreur produit principal:', productError)
        throw productError
      }

      console.log('Produit principal chargé:', productData)

      // Charger les variantes séparément
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)

      if (variantsError) {
        console.error('Erreur variantes:', variantsError)
        throw variantsError
      }

      console.log('Variantes chargées:', variantsData)

      const fullProduct: ProductWithVariants = {
        ...productData,
        product_variants: variantsData || []
      }

      setProduct(fullProduct)

      // Sélectionner automatiquement la première variante en stock
      const firstAvailableVariant = variantsData?.find(v => v.stock > 0)
      if (firstAvailableVariant) {
        setSelectedVariant(firstAvailableVariant)
        setSelectedSize(firstAvailableVariant.taille)
        console.log('Variante sélectionnée:', firstAvailableVariant)
      }
    } catch (error: unknown) {
      console.error('Erreur lors du chargement du produit:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadRelatedProducts = async () => {
    try {
      console.log('Chargement des produits similaires...')
      
      // Charger les produits similaires (même catégorie)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('categorie', product?.categorie || 'Homme')
        .neq('product_id', productId)
        .limit(4)

      if (productsError) {
        console.error('Erreur produits similaires:', productsError)
        return
      }

      console.log('Produits similaires trouvés:', productsData?.length)

      if (productsData && productsData.length > 0) {
        // Charger les variantes pour chaque produit
        const productsWithVariants = await Promise.all(
          productsData.map(async (prod) => {
            const { data: variants } = await supabase
              .from('product_variants')
              .select('*')
              .eq('product_id', prod.product_id)
              .gt('stock', 0)
              .limit(3)

            return {
              ...prod,
              variants: variants || []
            }
          })
        )

        // Garder seulement les produits qui ont des variantes en stock
        const validProducts = productsWithVariants.filter(p => p.variants.length > 0)
        setRelatedProducts(validProducts)
        console.log('Produits avec stock:', validProducts.length)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits similaires:', error)
    }
  }

  const handleSizeChange = (size: number) => {
    const variant = product?.product_variants.find(v =>
      v.taille === size && v.couleur === selectedVariant?.couleur && v.stock > 0
    )
    if (variant) {
      setSelectedSize(size)
      setSelectedVariant(variant)
    }
  }

  const handleColorChange = (color: string) => {
    const variantsForColor = product?.product_variants.filter(v => v.couleur === color && v.stock > 0)
    if (variantsForColor && variantsForColor.length > 0) {
      const firstVariant = variantsForColor[0]
      setSelectedVariant(firstVariant)
      setSelectedSize(firstVariant.taille)
    }
  }

  const handleAddToCart = async () => {
    if (!selectedVariant || !product) return

    if (profile?.role === 'vendeur' || profile?.role === 'admin') {
      console.log('Vendeur/Admin détecté - ajout au panier bloqué')
      return
    }

    try {
      await addItem({
        sku: selectedVariant.sku,
        name: selectedVariant.name,
        price: selectedVariant.prix_eur,
        image: cleanImageUrl(getFirstImage(selectedVariant.images)) || cleanImageUrl(getFirstImage(product.images)),
        size: selectedVariant.taille,
        condition: selectedVariant.etat
      })
      triggerAddAnimation()
    } catch (err) {
      console.error('Erreur lors de l\'ajout au panier:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error || 'Produit non trouvé'}</p>
          <Link
            href="/products"
            className="bg-black text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux produits
          </Link>
        </div>
      </div>
    )
  }

  // Grouper les variantes par couleur
  const variantsByColor = product.product_variants.reduce((acc, variant) => {
    const color = variant.couleur || 'Default'
    if (!acc[color]) {
      acc[color] = []
    }
    acc[color].push(variant)
    return acc
  }, {} as Record<string, typeof product.product_variants>)

  const availableSizes = selectedVariant && selectedVariant.couleur
    ? [...new Set(
        product.product_variants
          .filter(v => v.couleur === selectedVariant.couleur && v.stock > 0)
          .map(v => v.taille)
      )].sort((a, b) => a - b)
    : [...new Set(product.product_variants.filter(v => v.stock > 0).map(v => v.taille))].sort((a, b) => a - b)

  const imageUrls = selectedVariant?.images 
    ? selectedVariant.images.split('|').map((url: string) => cleanImageUrl(url)).filter(Boolean) as string[]
    : product.images 
    ? product.images.split('|').map((url: string) => cleanImageUrl(url)).filter(Boolean) as string[]
    : []

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-black">Accueil</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-black">Produits</Link>
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images - Côté gauche */}
          <div className="space-y-4">
            {/* Image principale */}
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              {imageUrls.length > 0 ? (
                <Image
                  src={imageUrls[selectedImageIndex]}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400">Aucune image</span>
                </div>
              )}
            </div>

            {/* Miniatures */}
            {imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {imageUrls.map((url: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations produit - Côté droit */}
          <div className="space-y-6">
            {/* En-tête produit */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>{selectedVariant?.brand || 'NIKE'}</span>
              </div>
              <h1 className="text-3xl font-bold text-black mb-2">
                {product.name}
              </h1>
              <div className="mb-4">
                <span className="text-sm text-gray-700">
                  {product.categorie} • {selectedVariant?.etat === 'NEUF' ? 'Neuf' : 'Seconde main'}
                </span>
              </div>
              {selectedVariant && (
                <div className="text-2xl font-bold text-black">
                  {selectedVariant.prix_eur.toFixed(2)} €
                </div>
              )}
            </div>

            {/* Couleurs */}
            {Object.keys(variantsByColor).length > 1 && (
              <div>
                <h3 className="text-sm font-medium text-black mb-3">COULEUR</h3>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(variantsByColor).map(([color, variants]) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedVariant?.couleur === color
                          ? 'border-black'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {variants[0].images ? (
                        <Image
                          src={cleanImageUrl(getFirstImage(variants[0].images)) || '/placeholder.jpg'}
                          alt={color}
                          width={64}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full"
                          style={{ 
                            backgroundColor: color === 'NOIR' ? '#000' : 
                                           color === 'BLANC' ? '#fff' : 
                                           color === 'ROUGE' ? '#dc2626' : 
                                           color === 'BLEU' ? '#2563eb' : '#9ca3af'
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
                {selectedVariant?.couleur && (
                  <p className="text-xs text-gray-700 mt-2">{selectedVariant.couleur}</p>
                )}
              </div>
            )}

            {/* Tailles */}
            <div>
              <h3 className="text-sm font-medium text-black mb-3">TAILLE</h3>
              <div className="grid grid-cols-8 gap-2">
                {availableSizes.map(size => {
                  const variant = product.product_variants.find(v => 
                    v.taille === size && v.couleur === selectedVariant?.couleur && v.stock > 0
                  )
                  const isLowStock = variant && variant.stock <= 2
                  const isSelected = selectedSize === size
                  
                  return (
                    <div key={size} className="relative">
                      <button
                        onClick={() => handleSizeChange(size)}
                        disabled={!variant}
                        className={`w-full h-9 border-2 rounded-md text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-black bg-black text-white'
                            : variant
                            ? 'border-gray-300 hover:border-gray-500 bg-white text-black'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                        }`}
                      >
                        {size}
                      </button>
                      {/* Cercle rouge pour stock faible */}
                      {isLowStock && !isSelected && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Message de stock faible - Masqué pour seconde main */}
            {selectedVariant && selectedVariant.stock <= 2 && selectedVariant.etat !== 'SECONDE_MAIN' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <p className="text-red-700 font-medium text-sm">
                  Plus que {selectedVariant.stock} en stock
                </p>
              </div>
            )}

            {/* Bouton d'ajout au panier */}
            {selectedVariant && (
              <div className="space-y-4">
                {(profile?.role === 'vendeur' || profile?.role === 'admin') ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <span className="font-semibold text-blue-800">
                      Mode consultation {profile?.role === 'admin' ? 'administrateur' : 'vendeur'}
                    </span>
                    <p className="text-blue-700 text-sm mt-1">
                      Stock: {selectedVariant.stock} • Prix: {selectedVariant.prix_eur.toFixed(2)} €
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={selectedVariant.stock === 0}
                    className={`w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                      selectedVariant.stock === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-black hover:bg-gray-800'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {selectedVariant.stock === 0 ? 'Rupture de stock' : 'AJOUTER AU PANIER'}
                  </button>
                )}
              </div>
            )}

            {/* Description réductible */}
            <div>
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="w-full py-4 flex items-center justify-between transition-colors"
              >
                <span className="text-sm font-medium text-black">DESCRIPTIF PRODUIT</span>
                <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${showDescription ? 'rotate-180' : ''}`} />
              </button>
              
              {showDescription && (
                <div className="pb-4 border-b border-gray-200">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {product.description || selectedVariant?.description || 
                        `Article issu de la sélection OUTLET (anciennes collections et fins de stocks de saisons précédentes retournés par les magasins). Les produits OUTLET ne sont pas éligibles aux remises ni aux coupons.`
                      }
                    </p>
                    
                    {selectedVariant && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-black text-sm">Détails :</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                          <div>Taille : {selectedVariant.taille}</div>
                          <div>État : {selectedVariant.etat === 'NEUF' ? 'Neuf' : 'Seconde main'}</div>
                          {selectedVariant.couleur && <div>Couleur : {selectedVariant.couleur}</div>}
                          {selectedVariant.brand && <div>Marque : {selectedVariant.brand}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Services */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Truck className="h-4 w-4 text-gray-600" />
                <span>Livraison offerte dès 90€ d'achat*</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Shield className="h-4 w-4 text-gray-600" />
                <span>Paiement 100% sécurisé</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <RotateCcw className="h-4 w-4 text-gray-600" />
                <span>30 jours pour changer d'avis*</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section "Vous aimerez aussi" */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-black mb-8 text-center">
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.product_id}
                  product={relatedProduct}
                  variants={relatedProduct.variants}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notification d'ajout au panier */}
      {selectedVariant && (
        <AddToCartNotification
          isVisible={showNotification}
          productName={selectedVariant.name}
          productImage={cleanImageUrl(getFirstImage(selectedVariant.images)) || cleanImageUrl(getFirstImage(product.images))}
          size={selectedVariant.taille}
          condition={selectedVariant.etat}
          price={selectedVariant.prix_eur}
          onClose={hideNotification}
        />
      )}
    </div>
  )
}
