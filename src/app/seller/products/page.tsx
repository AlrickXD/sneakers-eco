'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { supabase } from '@/lib/supabase'
import { ProductVariant } from '@/types/database'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Package, Plus, Edit, Trash2, AlertTriangle, Search, Filter, Save, X, Check, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getFirstImage } from '@/utils/imageUtils'

type FilterType = 'all' | 'low_stock' | 'out_of_stock' | 'in_stock'
type EtatFilterType = 'all' | 'neuf' | 'seconde_main'
type SortType = 'name' | 'price' | 'sku'

export default function SellerProductsPage() {
  const [products, setProducts] = useState<ProductVariant[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{[key: string]: any}>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [etatFilter, setEtatFilter] = useState<EtatFilterType>('neuf')
  const [sortBy, setSortBy] = useState<SortType>('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(20)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [products, searchTerm, filterType, etatFilter, sortBy, sortAsc])

  useEffect(() => {
    setCurrentPage(1) // Reset à la première page quand les filtres changent
  }, [searchTerm, filterType, etatFilter])

  const applyFiltersAndSort = () => {
    let filtered = [...products]

    // Recherche par nom ou SKU
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtrage par stock
    switch (filterType) {
      case 'low_stock':
        filtered = filtered.filter(p => p.stock <= 5 && p.stock > 0)
        break
      case 'out_of_stock':
        filtered = filtered.filter(p => p.stock <= 0)
        break
      case 'in_stock':
        filtered = filtered.filter(p => p.stock > 5)
        break
      default:
        break
    }

    // Filtrage par état
    switch (etatFilter) {
      case 'neuf':
        filtered = filtered.filter(p => p.etat === 'NEUF')
        break
      case 'seconde_main':
        filtered = filtered.filter(p => p.etat === 'SECONDE_MAIN')
        break
      default:
        break
    }

    // Tri
    filtered.sort((a, b) => {
      let aVal, bVal
      switch (sortBy) {
        case 'price':
          aVal = a.prix_eur
          bVal = b.prix_eur
          break
        case 'sku':
          aVal = a.sku
          bVal = b.sku
          break
        default:
          aVal = a.name
          bVal = b.name
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })

    setFilteredProducts(filtered)
  }

  // Calcul des produits paginés
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const loadProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      // Charger TOUS les produits (modèle centralisé)
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .order('sku', { ascending: false })

      if (error) throw error
      
      const allProducts = data || []
      setProducts(allProducts)
      
      console.log('📦 Statistiques Page Produits:', {
        totalProducts: allProducts.length,
        lowStock: allProducts.filter(p => p.stock <= 5 && p.stock > 0).length,
        outOfStock: allProducts.filter(p => p.stock <= 0).length,
        inStock: allProducts.filter(p => p.stock > 5).length,
        sampleProducts: allProducts.slice(0, 3).map(p => `${p.name} (stock: ${p.stock})`)
      })
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des produits:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (product: ProductVariant) => {
    setEditingProduct(product.sku)
    setEditValues({
      sku: product.sku,
      name: product.name,
      prix_eur: product.prix_eur,
      stock: product.stock,
      brand: product.brand || '',
      taille: product.taille,
      etat: product.etat,
      images: product.images || '',
      description: product.description || '',
      couleur: product.couleur || ''
    })
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    setEditValues({})
  }

  const saveEdit = async (sku: string) => {
    try {
      // Si le SKU a changé, on doit d'abord vérifier qu'il n'existe pas déjà
      if (editValues.sku !== sku) {
        const { data: existingProduct } = await supabase
          .from('product_variants')
          .select('sku')
          .eq('sku', editValues.sku)
          .single()
        
        if (existingProduct) {
          setError('Ce SKU existe déjà. Veuillez en choisir un autre.')
          return
        }
      }

      const updateData = {
        sku: editValues.sku,
        name: editValues.name,
        prix_eur: parseFloat(editValues.prix_eur),
        stock: parseInt(editValues.stock),
        brand: editValues.brand,
        taille: parseInt(editValues.taille),
        etat: editValues.etat,
        images: editValues.images,
        description: editValues.description,
        couleur: editValues.couleur
      }

      const { error } = await supabase
        .from('product_variants')
        .update(updateData)
        .eq('sku', sku)

      if (error) throw error

      // Mettre à jour localement
      setProducts(products.map(p => 
        p.sku === sku 
          ? { 
              ...p, 
              ...updateData
            }
          : p
      ))

      setEditingProduct(null)
      setEditValues({})
    } catch (error: unknown) {
      console.error('Erreur lors de la sauvegarde:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
    }
  }

  const deleteProduct = async (sku: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible et supprimera toutes les variantes de ce produit.')) return

    setDeletingProduct(sku)
    try {
      // Trouver le product_id de cette variante
      const product = products.find(p => p.sku === sku)
      if (!product) {
        throw new Error('Produit non trouvé')
      }

      const productId = product.product_id
      console.log('🗑️ Suppression du produit:', productId)

      // 1. Supprimer toutes les variantes du produit
      console.log('📦 Suppression de toutes les variantes...')
      const { error: variantsError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', productId)

      if (variantsError) {
        console.error('❌ Erreur suppression variantes:', variantsError)
        throw variantsError
      }

      // 2. Supprimer le produit principal
      console.log('📝 Suppression du produit principal...')
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('product_id', productId)

      if (productError) {
        console.error('❌ Erreur suppression produit:', productError)
        throw productError
      }

      console.log('✅ Produit supprimé avec succès')

      // Mettre à jour l'interface locale
      setProducts(products.filter(p => p.product_id !== productId))

    } catch (error: unknown) {
      console.error('Erreur lors de la suppression:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      setError(errorMessage)
    } finally {
      setDeletingProduct(null)
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { text: 'Rupture', color: 'text-red-600 bg-red-50' }
    if (stock <= 5) return { text: 'Stock faible', color: 'text-orange-600 bg-orange-50' }
    return { text: 'En stock', color: 'text-green-600 bg-green-50' }
  }

  if (loading) {
    return (
      <AuthGuard allowRoles={['vendeur', 'admin']}>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <LoadingSpinner size="lg" />
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard allowRoles={['vendeur', 'admin']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/seller"
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Retour au dashboard
              </Link>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-black">Tous les Produits</h1>
                <p className="text-gray-600 mt-2">
                  Gérez l'ensemble du catalogue et surveillez les performances
                </p>
              </div>
              <Link
                href="/seller/products/add"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Ajouter un produit
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-red-700">{error}</span>
              <button 
                onClick={() => setError('')}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Contrôles de recherche et filtrage */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, SKU ou marque..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              {/* Filtre par stock */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">Tous les produits</option>
                <option value="in_stock">En stock (&gt;5)</option>
                <option value="low_stock">Stock faible (1-5)</option>
                <option value="out_of_stock">Rupture de stock</option>
              </select>

              {/* Filtre par état */}
              <select
                value={etatFilter}
                onChange={(e) => setEtatFilter(e.target.value as EtatFilterType)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">Tous les états</option>
                <option value="neuf">Neuf</option>
                <option value="seconde_main">Seconde main</option>
              </select>

              {/* Tri */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="name">Trier par nom</option>
                <option value="price">Trier par prix</option>
                <option value="sku">Trier par SKU</option>
              </select>

              {/* Ordre de tri */}
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {sortAsc ? 'Croissant' : 'Décroissant'}
              </button>
            </div>
            
            {/* Résultats */}
            <div className="mt-4 text-sm text-gray-600">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} 
              {searchTerm && ` trouvé${filteredProducts.length > 1 ? 's' : ''} pour "${searchTerm}"`}
              {filterType !== 'all' && ` • Stock: ${
                filterType === 'in_stock' ? 'En stock' :
                filterType === 'low_stock' ? 'Stock faible' :
                'Rupture de stock'
              }`}
              {etatFilter !== 'all' && ` • État: ${
                etatFilter === 'neuf' ? 'Neuf' : 'Seconde main'
              }`}
              {totalPages > 1 && (
                <span> • Page {currentPage} sur {totalPages}</span>
              )}
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-black">{products.length}</div>
                  <div className="text-sm text-gray-600">Produits totaux</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-black">
                    {products.filter(p => p.stock <= 5 && p.stock > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Stock faible</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-black">
                    {products.filter(p => p.stock <= 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Rupture de stock</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-black">
                    {products.filter(p => p.stock > 5).length}
                  </div>
                  <div className="text-sm text-gray-600">En stock</div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des produits */}
          {currentProducts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-2">
                {products.length === 0 ? 'Aucun produit' : 'Aucun résultat'}
              </h3>
              <p className="text-gray-600 mb-6">
                {products.length === 0 
                  ? 'Vous n\'avez pas encore ajouté de produits. Commencez par ajouter votre premier produit.'
                  : 'Aucun produit ne correspond à vos critères de recherche ou de filtrage.'
                }
              </p>
              <Link
                href="/seller/products/add"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Ajouter mon premier produit
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        État
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentProducts.map((product) => {
                      const stockStatus = getStockStatus(product.stock)
                      
                      return (
                        <tr key={product.sku} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-16 w-16 relative">
                                {product.images && getFirstImage(product.images) ? (
                                  <Image
                                    src={getFirstImage(product.images) || '/placeholder.jpg'}
                                    alt={product.name}
                                    fill
                                    className="object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="text-sm font-medium text-black">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {product.brand} • Taille {product.taille}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  SKU: {product.sku}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-black">
                              {product.prix_eur.toFixed(2)} €
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                              {product.stock} • {stockStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              product.etat === 'NEUF' 
                                ? 'text-green-800 bg-green-100'
                                : 'text-blue-800 bg-blue-100'
                            }`}>
                              {product.etat === 'NEUF' ? 'Neuf' : 'Seconde main'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEdit(product)}
                                className="text-blue-600 hover:text-blue-700 p-1"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <Link
                                href={`/p/${product.product_id}`}
                                className="text-gray-600 hover:text-gray-700 p-1"
                                title="Voir le produit"
                                target="_blank"
                              >
                                <Package className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => deleteProduct(product.sku)}
                                disabled={deletingProduct === product.sku}
                                className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50"
                                title="Supprimer"
                              >
                                {deletingProduct === product.sku ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Suivant
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Affichage de{' '}
                        <span className="font-medium">{indexOfFirstProduct + 1}</span> à{' '}
                        <span className="font-medium">
                          {Math.min(indexOfLastProduct, filteredProducts.length)}
                        </span>{' '}
                        sur <span className="font-medium">{filteredProducts.length}</span> résultats
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1
                          const isCurrentPage = pageNumber === currentPage
                          
                          // Afficher seulement quelques pages autour de la page courante
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => paginate(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  isCurrentPage
                                    ? 'z-10 bg-black border-black text-white'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNumber}
                              </button>
                            )
                          } else if (
                            pageNumber === currentPage - 3 ||
                            pageNumber === currentPage + 3
                          ) {
                            return (
                              <span
                                key={pageNumber}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            )
                          }
                          return null
                        })}
                        
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal d'édition */}
          {editingProduct && (
            <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-black">Modifier le produit</h2>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all duration-200"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SKU */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        SKU *
                      </label>
                      <input
                        type="text"
                        value={editValues.sku || ''}
                        onChange={(e) => setEditValues({...editValues, sku: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    {/* Nom */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Nom du produit *
                      </label>
                      <input
                        type="text"
                        value={editValues.name || ''}
                        onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    {/* Marque */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Marque
                      </label>
                      <input
                        type="text"
                        value={editValues.brand || ''}
                        onChange={(e) => setEditValues({...editValues, brand: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    {/* Prix */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Prix (€) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editValues.prix_eur || ''}
                        onChange={(e) => setEditValues({...editValues, prix_eur: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Stock *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editValues.stock || ''}
                        onChange={(e) => setEditValues({...editValues, stock: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    {/* Taille */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Taille *
                      </label>
                      <select
                        value={editValues.taille || ''}
                        onChange={(e) => setEditValues({...editValues, taille: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        {[35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46].map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    {/* État */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        État *
                      </label>
                      <select
                        value={editValues.etat || ''}
                        onChange={(e) => setEditValues({...editValues, etat: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="NEUF">Neuf</option>
                        <option value="SECONDE_MAIN">Seconde main</option>
                      </select>
                    </div>

                    {/* Couleur */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Couleur
                      </label>
                      <input
                        type="text"
                        value={editValues.couleur || ''}
                        onChange={(e) => setEditValues({...editValues, couleur: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="ex: NOIR, BLANC, ROUGE / BLEU"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-black mb-2">
                      Description
                    </label>
                    <textarea
                      value={editValues.description || ''}
                      onChange={(e) => setEditValues({...editValues, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Description du produit..."
                    />
                  </div>

                  {/* Images */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-black mb-2">
                      URLs des images (séparées par |)
                    </label>
                    <textarea
                      value={editValues.images || ''}
                      onChange={(e) => setEditValues({...editValues, images: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="https://exemple.com/image1.jpg|https://exemple.com/image2.jpg"
                    />
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => saveEdit(editingProduct)}
                      className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Sauvegarder
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
