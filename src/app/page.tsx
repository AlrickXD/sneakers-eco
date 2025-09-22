'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Product, ProductVariant } from '@/types/database'
import { ProductCard } from '@/components/products/ProductCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductWithVariants extends Product {
  variants: ProductVariant[]
}

export default function HomePage() {
  const [products, setProducts] = useState<ProductWithVariants[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [itemsPerSlide, setItemsPerSlide] = useState(4)

  useEffect(() => {
    loadProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerSlide(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerSlide(2)
      } else if (window.innerWidth < 1280) {
        setItemsPerSlide(3)
      } else {
        setItemsPerSlide(4)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadProducts = async () => {
    try {
      // Charger les produits
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(12)

      if (productsError) throw productsError

      // Charger les variantes pour ces produits
      const productIds = productsData?.map(p => p.product_id) || []
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .in('product_id', productIds)

      if (variantsError) throw variantsError

      // Combiner les données et filtrer les produits avec images valides
      const productsWithVariants = productsData?.map(product => ({
        ...product,
        variants: variantsData?.filter(v => v.product_id === product.product_id) || []
      })).filter(product => {
        // Fonction pour vérifier les images valides
        const hasValidImages = (prod: any, variants: any[] = []): boolean => {
          const cleanImageUrls = (imageString: string | undefined | null): string[] => {
            if (!imageString) return []
            
            return imageString
              .split('|')
              .map(url => url.trim())
              .filter(url => {
                if (!url || url.length < 4) return false
                if (!url.startsWith('http://') && !url.startsWith('https://')) return false
                try {
                  new URL(url)
                  return true
                } catch {
                  return false
                }
              })
          }
          
          // Vérifier les images du produit principal
          const productImages = cleanImageUrls(prod.images)
          if (productImages.length > 0) return true
          
          // Vérifier les images des variantes
          if (variants && variants.length > 0) {
            return variants.some(variant => {
              const variantImages = cleanImageUrls(variant.images)
              return variantImages.length > 0
            })
          }
          
          return false
        }
        
        return hasValidImages(product, product.variants)
      }) || []

      setProducts(productsWithVariants)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Erreur lors du chargement des produits:', error)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const totalSlides = Math.ceil(products.length / itemsPerSlide)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const getCurrentProducts = () => {
    const start = currentSlide * itemsPerSlide
    const end = start + itemsPerSlide
    return products.slice(start, end)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <button
            onClick={loadProducts}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-black text-white">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              PÈRE2CHAUSSURES
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              La marketplace éco-responsable pour les chaussures. 
              Découvrez des modèles neufs et d&apos;occasion à prix réduits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products?condition=new"
                className="bg-white text-black px-8 py-4 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors"
              >
                Découvrir le neuf
              </Link>
              <Link
                href="/products?condition=secondhand"
                className="border border-white text-white px-8 py-4 rounded-lg font-semibold text-center hover:bg-white hover:text-black transition-colors"
              >
                Seconde main
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Produits en vedette */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-black">
              Produits en vedette
            </h2>
            <Link
              href="/products"
              className="text-black font-semibold hover:underline"
            >
              Voir tout →
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucun produit disponible pour le moment.</p>
            </div>
          ) : (
            <div className="relative px-16">
              {/* Navigation du slider */}
              {totalSlides > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200"
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft className="h-6 w-6 text-black" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200"
                    disabled={currentSlide === totalSlides - 1}
                  >
                    <ChevronRight className="h-6 w-6 text-black" />
                  </button>
                </>
              )}

              {/* Conteneur du slider */}
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                    <div 
                      key={slideIndex}
                      className="w-full flex-shrink-0"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((product) => (
                          <ProductCard
                            key={product.product_id}
                            product={product}
                            variants={product.variants}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicateurs de slide */}
              {totalSlides > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                        index === currentSlide ? 'bg-black' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Catégories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 sm:gap-12 max-w-3xl mx-auto">
            {[
              { name: 'Homme', icon: '👨', filter: 'gender=homme' },
              { name: 'Femme', icon: '👩', filter: 'gender=femme' },
              { name: 'Enfant', icon: '🧒', filter: 'gender=enfant' }
            ].map((category) => (
              <Link
                key={category.name}
                href={`/products?${category.filter}`}
                className="group"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </span>
                </div>
                <h3 className="text-center mt-4 font-semibold text-black text-lg group-hover:text-gray-700 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section éco-responsable */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-black mb-6">
              Mode éco-responsable
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Chaque achat sur Père2Chaussures contribue à réduire l&apos;impact environnemental 
              de l&apos;industrie de la mode. Donnez une seconde vie aux chaussures et 
              participez à l&apos;économie circulaire.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">♻️</span>
                </div>
                <h3 className="font-semibold text-black mb-2">Économie circulaire</h3>
                <p className="text-gray-600">
                  Prolongez la durée de vie des chaussures
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="font-semibold text-black mb-2">Impact réduit</h3>
                <p className="text-gray-600">
                  Moins de production, moins de déchets
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="font-semibold text-black mb-2">Prix accessibles</h3>
                <p className="text-gray-600">
                  Chaussures de qualité à prix réduits
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}