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
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [autoSlideEnabled, setAutoSlideEnabled] = useState(false)

  useEffect(() => {
    loadProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth
      const mobile = windowWidth < 768
      
      setIsMobile(mobile)
      setAutoSlideEnabled(true) // Auto-slide sur tous les écrans
      
      if (mobile) {
        setItemsPerSlide(2) // 2 produits sur mobile
      } else if (windowWidth < 1024) {
        setItemsPerSlide(2)
      } else if (windowWidth < 1280) {
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

  // Auto-slide uniquement sur mobile
  useEffect(() => {
    if (!autoSlideEnabled || totalSlides <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }, 4000) // Change de slide toutes les 4 secondes

    return () => clearInterval(interval)
  }, [autoSlideEnabled, totalSlides])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
    // Arrêter temporairement l'auto-slide après interaction manuelle
    if (autoSlideEnabled) {
      setAutoSlideEnabled(false)
      setTimeout(() => setAutoSlideEnabled(true), 8000) // Reprendre après 8s
    }
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
    // Arrêter temporairement l'auto-slide après interaction manuelle
    if (autoSlideEnabled) {
      setAutoSlideEnabled(false)
      setTimeout(() => setAutoSlideEnabled(true), 8000) // Reprendre après 8s
    }
  }

  const getCurrentProducts = () => {
    const start = currentSlide * itemsPerSlide
    const end = start + itemsPerSlide
    return products.slice(start, end)
  }

  // Distance minimale pour déclencher un swipe
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentSlide < totalSlides - 1) {
      nextSlide()
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
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
      <section className="relative overflow-hidden text-white">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/B.jpg)',
          }}
        />
        {/* Couche transparente */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        
        {/* Contenu */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-4xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              PÈRE2CHAUSSURES
            </h1>
            <p className="text-xl text-gray-200 mb-8 backdrop-blur-sm bg-black/20 rounded-lg p-4 inline-block">
              Le site <span className="text-green-400 font-semibold">éco-responsable</span> pour les chaussures. 
              Découvrez des modèles neufs et d&apos;occasion à prix réduits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products?condition=new"
                className="bg-white/90 text-black px-8 py-4 rounded-lg font-semibold text-center hover:bg-white transition-colors backdrop-blur-sm shadow-lg"
              >
                Découvrir le neuf
              </Link>
              <Link
                href="/products?condition=secondhand"
                className="border-2 border-white/80 text-white px-8 py-4 rounded-lg font-semibold text-center hover:bg-white/90 hover:text-black transition-colors backdrop-blur-sm bg-white/10"
              >
                Seconde main
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section éco-responsable */}
      <section className="py-20 relative overflow-hidden">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/A.jpg)',
          }}
        />
        {/* Couche transparente */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
        
        {/* Contenu */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-green-100/90 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="text-lg">🌱</span>
              Programme Seconde Main
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Et si vos anciennes chaussures avaient encore 
              <span className="text-green-600"> un rôle à jouer ?</span>
            </h2>
            <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
              Chez <span className="font-semibold text-gray-900">Père2Chaussure</span>, grâce à notre programme "seconde main" chaque paire compte
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {/* Card 1 - Reconditionnement */}
              <div className="group bg-white/85 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-green-100/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-xl">♻️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Encore en forme ?</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3 text-sm">
                  Nous les reconditionnons et vous gagnez un <span className="font-semibold text-green-600">code de réduction proportionnel</span> à leur valeur, jusqu'à <span className="font-bold text-green-700">20%</span>.
                </p>
                <div className="bg-green-50/80 rounded-lg p-3 border border-green-200/50">
                  <p className="text-xs text-green-800">
                    💡 <span className="font-medium">Astuce :</span> Plus la paire est précieuse, plus vous êtes récompensé (cochez l'option écoresponsable lors de votre prochain achat).
                  </p>
                </div>
              </div>

              {/* Card 2 - Recyclage */}
              <div className="group bg-white/85 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-green-100/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-xl">🔄</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Trop usées ?</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3 text-sm">
                  Pas de souci : nous les recyclons pour créer de nouvelles matières utiles.
                </p>
                <div className="bg-blue-50/80 rounded-lg p-3 border border-blue-200/50">
                  <p className="text-xs text-blue-800 font-medium">
                    🌍 Rien ne se perd, tout se transforme
                  </p>
                </div>
              </div>
            </div>

            {/* Résultat final */}
            <div className="bg-gradient-to-r from-green-600/90 to-emerald-600/90 rounded-xl p-6 text-white shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-2xl">✨</span>
                <h3 className="text-xl font-bold">Le résultat</h3>
              </div>
              <p className="text-base leading-relaxed max-w-2xl mx-auto">
                Vous <span className="font-semibold">faites des économies</span>, vos chaussures trouvent une 
                <span className="font-semibold"> seconde vie</span>, et ensemble nous 
                <span className="font-semibold"> réduisons les déchets</span>. 
                Un geste simple pour un impact durable ! 🌱
              </p>
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
            <div className="relative px-4 sm:px-8 md:px-16">
              {/* Navigation du slider - toujours visible avec auto-slide */}
              {totalSlides > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute -left-1 sm:-left-4 md:-left-6 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 sm:p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200"
                    disabled={currentSlide === 0}
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-black" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute -right-1 sm:-right-4 md:-right-6 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 sm:p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200"
                    disabled={currentSlide === totalSlides - 1}
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-black" />
                  </button>
                </>
              )}

              {/* Conteneur du slider */}
              <div 
                className="overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                    <div 
                      key={slideIndex}
                      className="w-full flex-shrink-0"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
                <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
                  {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSlide(index)
                        // Arrêter temporairement l'auto-slide après interaction manuelle
                        if (autoSlideEnabled) {
                          setAutoSlideEnabled(false)
                          setTimeout(() => setAutoSlideEnabled(true), 8000) // Reprendre après 8s
                        }
                      }}
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-colors duration-300 touch-manipulation ${
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

    </div>
  )
}