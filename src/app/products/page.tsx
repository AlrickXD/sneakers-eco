'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Product, ProductVariant } from '@/types/database'
import { ProductCard } from '@/components/products/ProductCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Filter, X, ChevronDown } from 'lucide-react'

interface ProductWithVariants extends Product {
  variants: ProductVariant[]
}

function ProductsContent() {
  const [products, setProducts] = useState<ProductWithVariants[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const itemsPerPage = 20
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const category = searchParams.get('category')
  const size = searchParams.get('size')
  const query = searchParams.get('query') || searchParams.get('q') // Support both query and q

  // Gestion des filtres multiples
  const genderParams = searchParams.get('gender')
  const genders = genderParams ? genderParams.split(',') : []
  const conditionParams = searchParams.get('condition')
  const conditions = conditionParams ? conditionParams.split(',') : []
  const brandParams = searchParams.get('brand')
  const brands = brandParams ? brandParams.split(',') : []
  const colorParams = searchParams.get('couleur')
  const colors = colorParams ? colorParams.split(',') : []

  // Debug des paramètres URL
  console.log('🔍 PARAMETRES URL:')
  console.log('- brandParams:', brandParams)
  console.log('- brands array:', brands)
  console.log('- colorParams:', colorParams)
  console.log('- colors array:', colors)
  
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')

  useEffect(() => {
    setCurrentPage(1) // Reset à la page 1 quand les filtres changent
    loadProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, conditionParams, size, query, genderParams, brandParams, colorParams, minPrice, maxPrice, sortBy, sortOrder])

  useEffect(() => {
    loadProducts() // Recharger quand la page change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const loadProducts = async () => {
    setLoading(true)
    try {
      // Construire la requête pour les produits
      let productsQuery = supabase.from('products').select('*')
      
      // Filtrer par catégorie si spécifiée
      if (category) {
        productsQuery = productsQuery.ilike('categorie', `%${category}%`)
      }
      
      // Recherche textuelle étendue (nom, description du produit)
      if (query) {
        productsQuery = productsQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      }

      const { data: productsData, error: productsError } = await productsQuery

      if (productsError) throw productsError

      if (!productsData || productsData.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      // Construire la requête pour les variantes
      const productIds = productsData.map(p => p.product_id)
      let variantsQuery = supabase
        .from('product_variants')
        .select('*')
        .in('product_id', productIds)
        .gt('stock', 0) // Exclure les variantes en rupture de stock

      // Filtrer par condition (gestion multiple)
      if (conditions.length > 0) {
        const etats = conditions.map(c => c === 'new' ? 'NEUF' : 'SECONDE_MAIN')
        variantsQuery = variantsQuery.in('etat', etats)
      }

      // Filtrer par marque (gestion multiple)
      if (brands.length > 0) {
        console.log('🔍 DEBUT FILTRAGE MARQUES')
        console.log('Marques à filtrer:', brands)
        console.log('Type des marques:', brands.map(b => typeof b))
        console.log('Longueur des marques:', brands.map(b => b.length))
        
        // Test: afficher la requête avant et après
        console.log('Query avant filtre marques:', variantsQuery)
        variantsQuery = variantsQuery.in('brand', brands)
        console.log('Query après filtre marques:', variantsQuery)
        console.log('✅ Filtre marques appliqué avec:', brands)
      }

      // Filtrer par couleur (gestion multiple avec ILIKE pour couleurs composées)
      if (colors.length > 0) {
        console.log('🎨 FILTRAGE COULEURS:', colors)
        
        // Construire une condition OR pour chaque couleur sélectionnée
        const colorConditions = colors.map(color => `couleur.ilike.%${color}%`).join(',')
        variantsQuery = variantsQuery.or(colorConditions)
        
        console.log('✅ Conditions couleurs appliquées:', colorConditions)
      }

      // Recherche textuelle dans les variantes (marque, couleur, nom) - seulement si pas de filtres spécifiques
      if (query && brands.length === 0 && colors.length === 0) {
        variantsQuery = variantsQuery.or(`brand.ilike.%${query}%,couleur.ilike.%${query}%,name.ilike.%${query}%`)
      }

      // Filtrer par taille
      if (size) {
        variantsQuery = variantsQuery.eq('taille', parseInt(size))
      }

      // Filtrer par prix
      if (minPrice) {
        variantsQuery = variantsQuery.gte('prix_eur', parseFloat(minPrice))
      }
      if (maxPrice) {
        variantsQuery = variantsQuery.lte('prix_eur', parseFloat(maxPrice))
      }

      let { data: variantsData, error: variantsError } = await variantsQuery

      // Debug: afficher quelques variantes pour vérifier les données
      if (variantsData && variantsData.length > 0) {
        console.log('Exemple de variantes récupérées:', variantsData.slice(0, 3).map(v => ({
          name: v.name,
          brand: v.brand,
          couleur: v.couleur,
          stock: v.stock
        })))
        console.log('Total variantes récupérées:', variantsData.length)
        console.log('Variantes avec marque:', variantsData.filter(v => v.brand).length)
        console.log('Variantes avec stock:', variantsData.filter(v => v.stock > 0).length)
        
        // Afficher les marques uniques trouvées
        const uniqueBrands = [...new Set(variantsData.map(v => v.brand).filter(Boolean))]
        console.log('Marques trouvées dans les résultats:', uniqueBrands)
        
        // Debug spécial pour Adidas
        if (brands.includes('Adidas Originals')) {
          const adidasVariants = variantsData.filter(v => v.brand === 'Adidas Originals')
          console.log('🔍 DEBUG ADIDAS ORIGINALS:')
          console.log('- Variantes Adidas Originals trouvées:', adidasVariants.length)
          console.log('- Avec stock > 0:', adidasVariants.filter(v => v.stock > 0).length)
          console.log('- Exemples:', adidasVariants.slice(0, 5).map(v => ({
            name: v.name,
            stock: v.stock,
            prix: v.prix_eur
          })))
        }
      }

      if (variantsError) {
        console.error('Erreur lors du chargement des variantes:', variantsError)
        // Si l'erreur est due aux colonnes manquantes, on continue sans les filtres brand/couleur
        if (variantsError.message?.includes('column') && (variantsError.message?.includes('brand') || variantsError.message?.includes('couleur'))) {
          console.warn('Les colonnes brand/couleur n\'existent pas encore. Exécutez le script migrate-to-new-schema.sql')
          // Refaire la requête sans les filtres brand/couleur
          let fallbackQuery = supabase
            .from('product_variants')
            .select('*')
            .in('product_id', productIds)
            .gt('stock', 0) // Exclure les variantes en rupture de stock

          if (conditions.length > 0) {
            const etats = conditions.map(c => c === 'new' ? 'NEUF' : 'SECONDE_MAIN')
            fallbackQuery = fallbackQuery.in('etat', etats)
          }
          if (size) {
            fallbackQuery = fallbackQuery.eq('taille', parseInt(size))
          }
          if (minPrice) {
            fallbackQuery = fallbackQuery.gte('prix_eur', parseFloat(minPrice))
          }
          if (maxPrice) {
            fallbackQuery = fallbackQuery.lte('prix_eur', parseFloat(maxPrice))
          }
          
          const { data: fallbackData, error: fallbackError } = await fallbackQuery
          if (fallbackError) throw fallbackError
          variantsData = fallbackData
          
          // Afficher un message d'avertissement à l'utilisateur
          setError('Les filtres marque et couleur ne sont pas encore disponibles. Veuillez contacter l\'administrateur.')
        } else {
          throw variantsError
        }
      }

      // Combiner les données et filtrer les produits qui ont des variantes et des images valides
      let productsWithVariants = productsData
        .map(product => ({
          ...product,
          variants: variantsData?.filter(v => v.product_id === product.product_id) || []
        }))
        .filter(product => {
          // Filtrer les produits qui ont des variantes ET des images valides
          if (product.variants.length === 0) return false
          
          // Importer la fonction hasValidImages ici pour éviter les problèmes de dépendances
          const hasValidImages = (prod: any, variants: any[] = []): boolean => {
            // Fonction pour nettoyer les URLs d'images
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
        })

      // Filtrer par genre (gestion multiple)
      if (genders.length > 0) {
        productsWithVariants = productsWithVariants.filter(product => {
          const name = product.name.toLowerCase()
          const category = product.categorie?.toLowerCase() || ''
          const sizes = product.variants.map((v: ProductVariant) => v.taille)
          const minSize = Math.min(...sizes)
          const maxSize = Math.max(...sizes)

          return genders.some(gender => {
            if (gender === 'homme') {
              // Homme : exclusions strictes d'abord
              if (name.includes('women') || name.includes('femme') || 
                  name.includes('woman') || name.includes('girl') ||
                  name.includes('kid') || name.includes('enfant') || 
                  name.includes('junior') || name.includes('child') ||
                  category.includes('femme') || category.includes('women') ||
                  category.includes('enfant') || category.includes('kid')) {
                return false
              }
              // Inclusions positives : tailles homme OU mots-clés explicites
              return (minSize >= 39 && maxSize >= 42) || 
                     name.includes('men') || name.includes('homme') || 
                     name.includes('man ') || category.includes('homme')
            } else if (gender === 'femme') {
              // Femme : exclusions strictes d'abord  
              if (name.includes('men') || name.includes('homme') ||
                  name.includes('kid') || name.includes('enfant') || 
                  name.includes('junior') || name.includes('child') ||
                  category.includes('homme') || category.includes('enfant')) {
                return false
              }
              // Inclusions : tailles femme OU mots-clés explicites
              return (minSize >= 35 && maxSize <= 42) || 
                     name.includes('women') || name.includes('femme') ||
                     name.includes('woman') || category.includes('femme')
            } else if (gender === 'enfant') {
              // Enfant : tailles petites OU mots-clés explicites
              return (maxSize <= 38) || 
                     name.includes('kid') || name.includes('enfant') || 
                     name.includes('junior') || name.includes('child') ||
                     category.includes('enfant') || category.includes('kid')
            }
            return false
          })
        })
      }

      // Compter le total pour la pagination
      const totalCount = productsWithVariants.length
      setTotalProducts(totalCount)

      // Trier les produits
      productsWithVariants.sort((a, b) => {
        let aValue, bValue
        switch (sortBy) {
          case 'price_asc':
            aValue = Math.min(...a.variants.map((v: ProductVariant) => v.prix_eur))
            bValue = Math.min(...b.variants.map((v: ProductVariant) => v.prix_eur))
            return aValue - bValue
          case 'price_desc':
            aValue = Math.min(...a.variants.map((v: ProductVariant) => v.prix_eur))
            bValue = Math.min(...b.variants.map((v: ProductVariant) => v.prix_eur))
            return bValue - aValue
          case 'name':
          default:
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }
      })

      // Appliquer la pagination
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedProducts = productsWithVariants.slice(startIndex, endIndex)

      setProducts(paginatedProducts)
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des produits:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getPageTitle = () => {
    if (query) return `Résultats pour "${query}"`
    if (conditions.length === 1) {
      if (conditions[0] === 'new') return 'Chaussures neuves'
      if (conditions[0] === 'secondhand') return 'Chaussures seconde main'
    }
    if (genders.length === 1) {
      if (genders[0] === 'homme') return 'Chaussures Homme'
      if (genders[0] === 'femme') return 'Chaussures Femme'
      if (genders[0] === 'enfant') return 'Chaussures Enfant'
    }
    if (genders.length > 1) {
      const genderLabels = genders.map(g => g.charAt(0).toUpperCase() + g.slice(1))
      return `Chaussures ${genderLabels.join(', ')}`
    }
    if (conditions.length > 1) {
      const conditionLabels = conditions.map(c => c === 'new' ? 'Neuves' : 'Seconde main')
      return `Chaussures ${conditionLabels.join(', ')}`
    }
    if (category) return `Catégorie: ${category}`
    return 'Tous les produits'
  }

  const getFilterCount = () => {
    let count = 0
    if (category) count++
    if (conditions.length > 0) count++
    if (size) count++
    if (query) count++
    if (genders.length > 0) count++
    if (brands.length > 0) count++
    if (colors.length > 0) count++
    if (minPrice) count++
    if (maxPrice) count++
    return count
  }

  const updateFilters = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(searchParams.toString())

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        current.delete(key)
      } else {
        current.set(key, value)
      }
    })

    router.push(`/products?${current.toString()}`)
  }

  // Fonction pour gérer les filtres multiples
  const toggleMultipleFilter = (filterType: 'gender' | 'condition' | 'brand' | 'couleur', value: string) => {
    const current = new URLSearchParams(searchParams.toString())
    let currentValues: string[] = []
    
    if (filterType === 'gender') {
      currentValues = genders
    } else if (filterType === 'condition') {
      currentValues = conditions
    } else if (filterType === 'brand') {
      currentValues = brands
    } else if (filterType === 'couleur') {
      currentValues = colors
    }

    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value) // Retirer si déjà présent
      : [...currentValues, value] // Ajouter si pas présent

    if (newValues.length === 0) {
      current.delete(filterType)
    } else {
      current.set(filterType, newValues.join(','))
    }

    router.push(`/products?${current.toString()}`)
  }

  const clearFilters = () => {
    router.push('/products')
  }

  const availableSizes = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]
  const priceRanges = [
    { label: 'Moins de 50€', min: null, max: '50' },
    { label: '50€ - 100€', min: '50', max: '100' },
    { label: '100€ - 200€', min: '100', max: '200' },
    { label: 'Plus de 200€', min: '200', max: null }
  ]

  // Marques disponibles dans la DB (basées sur les données réelles)
  const availableBrands = [
    'Nike',
    'Adidas Originals',
    'New Balance',
    'Jordan',
    'UGG',
    'Asics',
    'Lacoste',
    'Converse',
    'Puma',
    'Vans',
    'Timberland',
    'On Running',
    'Birkenstock',
    'Polo Ralph Lauren'
  ]
  
  // Couleurs individuelles exactes de la DB (triées par popularité)
  const availableColors = [
    'BLANC', 'NOIR', 'BEIGE', 'MARRON', 'GRIS', 'BLEU', 'ARGENT', 
    'ROSE', 'MARINE', 'ROUGE', 'KAKI', 'JAUNE', 'OR', 'BORDEAUX', 
    'MIEL', 'ARGENTE', 'VERT', 'MULTICOLORE', 'VIOLET', 'ORANGE'
  ]

  const totalPages = Math.ceil(totalProducts / itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, start + maxVisible - 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  // Supprimer le loading complet de la page

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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              {getPageTitle()}
            </h1>
            <p className="text-gray-600">
              {totalProducts} produit{totalProducts !== 1 ? 's' : ''} trouvé{totalProducts !== 1 ? 's' : ''} 
              {totalPages > 1 && (
                <span className="text-sm">
                  • Page {currentPage} sur {totalPages}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                if (e.target.value.includes('price')) {
                  setSortOrder('asc')
                }
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="name">Nom A-Z</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </select>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Masquer filtres' : 'Afficher filtres'} {getFilterCount() > 0 && `(${getFilterCount()})`}
            </button>
          </div>
        </div>

        {/* Filtres avec sections réductibles */}
        <div className={`${showFilters ? 'block' : 'hidden'} mb-8`}>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            {getFilterCount() > 0 && (
              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Effacer tous les filtres
                </button>
              </div>
            )}
            
            <div className="divide-y divide-gray-200">
              {/* Genre */}
              <details className="group" open>
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                  <span className="font-medium text-black">Genre ({genders.length})</span>
                  <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4">
                  <div className="space-y-2">
                    {[
                      { value: 'homme', label: 'Homme' },
                      { value: 'femme', label: 'Femme' },
                      { value: 'enfant', label: 'Enfant' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={genders.includes(option.value)}
                          onChange={() => toggleMultipleFilter('gender', option.value)}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </details>

              {/* Prix */}
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                  <span className="font-medium text-black">Rechercher par prix</span>
                  <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4">
                  <div className="space-y-2">
                    {priceRanges.map((range, index) => (
                      <label key={index} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="price"
                          checked={minPrice === range.min && maxPrice === range.max}
                          onChange={() => updateFilters({ 
                            minPrice: range.min,
                            maxPrice: range.max
                          })}
                          className="border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm text-gray-700">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </details>

              {/* État */}
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                  <span className="font-medium text-black">État</span>
                  <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4">
                  <div className="space-y-2">
                    {[
                      { value: 'new', label: 'Neuf' },
                      { value: 'secondhand', label: 'Seconde main' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={conditions.includes(option.value)}
                          onChange={() => toggleMultipleFilter('condition', option.value)}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </details>

              {/* Taille / Pointure */}
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                  <span className="font-medium text-black">Taille / Pointure</span>
                  <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-4 gap-1">
                    {availableSizes.map(s => (
                      <button
                        key={s}
                        onClick={() => updateFilters({ size: size === s.toString() ? null : s.toString() })}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          size === s.toString()
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </details>

              {/* Couleur */}
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                  <span className="font-medium text-black">Couleur</span>
                  <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableColors.map((color) => (
                      <label key={color} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={colors.includes(color)}
                          onChange={() => toggleMultipleFilter('couleur', color)}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm text-gray-700">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </details>

              {/* Marque */}
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                  <span className="font-medium text-black">Marque</span>
                  <ChevronDown className="h-4 w-4 text-gray-500 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableBrands.map((brand) => (
                      <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={brands.includes(brand)}
                          onChange={() => toggleMultipleFilter('brand', brand)}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm text-gray-700">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Filtres actifs */}
        {getFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {query && (
              <span className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Recherche: {query}
                <button onClick={() => updateFilters({ q: null })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {genders.map(gender => (
              <span key={gender} className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
                <button onClick={() => toggleMultipleFilter('gender', gender)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {category && (
              <span className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Catégorie: {category}
                <button onClick={() => updateFilters({ category: null })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {conditions.map(condition => (
              <span key={condition} className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {condition === 'new' ? 'Neuf' : 'Seconde main'}
                <button onClick={() => toggleMultipleFilter('condition', condition)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {size && (
              <span className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Taille: {size}
                <button onClick={() => updateFilters({ size: null })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Prix: {minPrice || '0'}€ - {maxPrice || '∞'}€
                <button onClick={() => updateFilters({ minPrice: null, maxPrice: null })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {brands.map(brand => (
              <span key={brand} className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {brand}
                <button onClick={() => toggleMultipleFilter('brand', brand)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {colors.map(color => (
              <span key={color} className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {color}
                <button onClick={() => toggleMultipleFilter('couleur', color)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Contenu principal */}
        <div className="relative">
          {/* Overlay de loading */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
                <LoadingSpinner size="md" />
                <span className="text-gray-700 font-medium">Chargement des produits...</span>
              </div>
            </div>
          )}
          
          {products.length === 0 && !loading ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-black mb-4">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                  Essayez de modifier vos critères de recherche ou parcourez nos autres catégories.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/products"
                    className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Voir tous les produits
                  </Link>
                  <Link
                    href="/"
                    className="border border-black text-black px-6 py-3 rounded-lg font-medium hover:bg-black hover:text-white transition-colors"
                  >
                    Retour à l&apos;accueil
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {products.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    variants={product.variants}
                  />
                ))}
              </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mb-12">
                    {/* Bouton Précédent */}
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>

                    {/* Numéros de page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => goToPage(1)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          1
                        </button>
                        {currentPage > 4 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                      </>
                    )}

                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pageNum === currentPage
                            ? 'bg-black text-white shadow-md'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => goToPage(totalPages)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    {/* Bouton Suivant */}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Suggestions */}
            {totalProducts > 0 && (
              <div className="mt-16 text-center">
                <h3 className="text-xl font-semibold text-black mb-4">
                  Vous ne trouvez pas votre bonheur ?
                </h3>
                <p className="text-gray-600 mb-6">
                  Découvrez nos autres catégories ou explorez notre sélection complète.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/products?condition=new"
                    className="bg-gray-100 text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Chaussures neuves
                  </Link>
                  <Link
                    href="/products?condition=secondhand"
                    className="bg-gray-100 text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Seconde main
                  </Link>
                  <Link
                    href="/products?gender=homme"
                    className="bg-gray-100 text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Homme
                  </Link>
                  <Link
                    href="/products?gender=femme"
                    className="bg-gray-100 text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Femme
                  </Link>
                  <Link
                    href="/products?gender=enfant"
                    className="bg-gray-100 text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Enfant
                  </Link>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">
      <LoadingSpinner size="lg" />
    </div>}>
      <ProductsContent />
    </Suspense>
  )
}
