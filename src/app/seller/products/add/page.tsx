'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Upload, Plus, X, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { ModernSelect } from '@/components/common/ModernSelect'

interface ProductVariant {
  taille: number
  prix_eur: number
  stock: number
  etat: 'NEUF' | 'SECONDE_MAIN'
}

export default function AddProductPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [createdProductId, setCreatedProductId] = useState('')
  const router = useRouter()

  // Données du produit principal
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productCategory, setProductCategory] = useState('Homme')
  const [productBrand, setProductBrand] = useState('')
  const [productSku, setProductSku] = useState('')
  const [primaryColor, setPrimaryColor] = useState('')
  const [secondaryColor, setSecondaryColor] = useState('')
  const [productImages, setProductImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  // Variantes du produit
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      taille: 40,
      prix_eur: 0,
      stock: 1,
      etat: 'NEUF'
    }
  ])

  const categoryOptions = [
    { value: 'Homme', label: 'Homme' },
    { value: 'Femme', label: 'Femme' },
    { value: 'Enfant', label: 'Enfant' }
  ]

  const brandOptions = [
    { value: 'Nike', label: 'Nike' },
    { value: 'Adidas Originals', label: 'Adidas Originals' },
    { value: 'New Balance', label: 'New Balance' },
    { value: 'Jordan', label: 'Jordan' },
    { value: 'UGG', label: 'UGG' },
    { value: 'Asics', label: 'Asics' },
    { value: 'Lacoste', label: 'Lacoste' },
    { value: 'Converse', label: 'Converse' },
    { value: 'Puma', label: 'Puma' },
    { value: 'Vans', label: 'Vans' },
    { value: 'Timberland', label: 'Timberland' },
    { value: 'On Running', label: 'On Running' },
    { value: 'Birkenstock', label: 'Birkenstock' },
    { value: 'Polo Ralph Lauren', label: 'Polo Ralph Lauren' }
  ]

  const availableColors = [
    'BLANC', 'NOIR', 'BEIGE', 'MARRON', 'GRIS', 'BLEU', 'ARGENT',
    'ROSE', 'MARINE', 'ROUGE', 'KAKI', 'JAUNE', 'OR', 'BORDEAUX',
    'MIEL', 'ARGENTE', 'VERT', 'MULTICOLORE', 'VIOLET', 'ORANGE'
  ]

  const sizes = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]

  const handleCustomBrand = (customBrand: string) => {
    // Ajouter la marque personnalisée à la liste si elle n'existe pas déjà
    const existingBrand = brandOptions.find(b => b.value.toLowerCase() === customBrand.toLowerCase())
    if (!existingBrand) {
      brandOptions.push({ value: customBrand, label: customBrand })
    }
  }

  const getFinalColor = () => {
    if (!primaryColor) return ''
    if (!secondaryColor) return primaryColor
    return `${primaryColor} / ${secondaryColor}`
  }

  const addVariant = () => {
    setVariants([...variants, {
      taille: 40,
      prix_eur: 0,
      stock: 1,
      etat: 'NEUF'
    }])
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = [...variants]

    if (field === 'prix_eur' || field === 'stock' || field === 'taille') {
      // Gérer les valeurs numériques et éviter NaN
      const numValue = value === '' ? 0 : Number(value)
      updatedVariants[index] = { ...updatedVariants[index], [field]: isNaN(numValue) ? 0 : numValue }
    } else {
      updatedVariants[index] = { ...updatedVariants[index], [field]: value }
    }

    setVariants(updatedVariants)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + productImages.length > 5) {
      setError('Maximum 5 images autorisées')
      return
    }

    setProductImages([...productImages, ...files])
    
    // Créer les URLs de prévisualisation
    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls])
  }

  const removeImage = (index: number) => {
    const newImages = productImages.filter((_, i) => i !== index)
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index)
    
    // Libérer l'URL de prévisualisation
    URL.revokeObjectURL(imagePreviewUrls[index])
    
    setProductImages(newImages)
    setImagePreviewUrls(newPreviewUrls)
  }

  const uploadImages = async (): Promise<string[]> => {
    console.log('🖼️ Début de l\'upload d\'images...')
    console.log('📁 Nombre d\'images à uploader:', productImages.length)

    if (productImages.length === 0) {
      console.log('ℹ️ Aucune image à uploader')
      return []
    }

    setUploadingImages(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < productImages.length; i++) {
        const image = productImages[i]
        console.log(`📤 Upload de l'image ${i + 1}/${productImages.length}...`)

        const fileExt = image.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `products/${fileName}`

        console.log(`  -> Nom du fichier: ${fileName}`)
        console.log(`  -> Taille: ${image.size} bytes`)
        console.log(`  -> Type: ${image.type}`)

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, image)

        if (uploadError) {
          console.error(`❌ Erreur upload image ${i + 1}:`, uploadError)
          throw uploadError
        }

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        console.log(`✅ Image ${i + 1} uploadée:`, data.publicUrl)
        uploadedUrls.push(data.publicUrl)
      }

      console.log('✅ Toutes les images ont été uploadées avec succès')
      return uploadedUrls
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload des images:', error)
      throw error
    } finally {
      setUploadingImages(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!productSku || !productName || !productDescription || !productBrand || !primaryColor || variants.some(v => v.prix_eur < 0)) {
      setError('Veuillez remplir tous les champs obligatoires (SKU, nom, description, marque, couleur primaire) et définir des prix positifs')
      setLoading(false)
      return
    }

    try {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')

      console.log('🔄 Début de la création du produit...')
      console.log('👤 Utilisateur connecté:', user.email)
      console.log('📋 Données du produit:', {
        productSku, productName, productCategory, productBrand, primaryColor, secondaryColor
      })

      // Vérifier les permissions de l'utilisateur
      console.log('🔐 Vérification des permissions...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('❌ Erreur récupération profil:', profileError)
        throw new Error('Impossible de vérifier les permissions utilisateur')
      }

      console.log('📋 Rôle utilisateur:', profile?.role)

      // Uploader les images
      console.log('🖼️ Upload des images...')
      const imageUrls = await uploadImages()
      console.log('✅ Images uploadées:', imageUrls.length, 'images')

      const imagesString = imageUrls.join('|')

      // Utiliser directement le SKU saisi par l'utilisateur
      const productId = productSku

      // Vérifier si un produit similaire existe déjà
      console.log('🔍 Vérification de l\'existence d\'un produit similaire...')
      const { data: existingProducts, error: existingError } = await supabase
        .from('products')
        .select('product_id, name')
        .ilike('name', `%${productName}%`)
        .limit(5)

      if (existingError) {
        console.error('❌ Erreur vérification produits existants:', existingError)
      } else {
        console.log('📋 Produits similaires trouvés:', existingProducts?.length || 0)
        if (existingProducts && existingProducts.length > 0) {
          console.log('⚠️ Produits similaires:', existingProducts.map(p => `${p.name} (${p.product_id})`))
        }
      }

      // 1. Créer le produit principal
      console.log('📝 Création du produit principal...')
      console.log('📋 Données d\'insertion produit:', {
        product_id: productId,
        name: productName,
        categorie: productCategory,
        description: productDescription,
        images: imagesString,
        seller_id: user.id
      })

      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          product_id: productId,
          name: productName,
          categorie: productCategory,
          description: productDescription,
          images: imagesString,
          seller_id: user.id
        })
        .select()

      console.log('📊 Résultat insertion produit:')
      console.log('  -> data:', productData)
      console.log('  -> error:', productError)

      if (productError) {
        console.error('❌ Erreur création produit:', productError)
        console.error('📋 Type d\'erreur:', typeof productError)
        console.error('📋 Clés d\'erreur:', Object.keys(productError))
        console.error('📋 Valeurs d\'erreur:', Object.values(productError))
        throw productError
      }
      console.log('✅ Produit principal créé avec succès')

      // 2. Créer les variantes
      console.log('📦 Création des variantes...')
      console.log('📋 Couleur finale:', getFinalColor())
      console.log('📋 Marque:', productBrand)
      console.log('📋 Catégorie:', productCategory)

      const variantInserts = variants.map((variant, index) => {
        const variantData = {
          sku: `${productId}-${variant.taille}-${variant.etat}`,
          product_id: productId,
          name: `${productName} - Taille ${variant.taille}`,
          brand: productBrand || null,
          etat: variant.etat,
          taille: variant.taille,
          categorie: productCategory,
          prix_eur: variant.prix_eur,
          stock: variant.stock,
          images: imagesString,
          couleur: getFinalColor() || null,
          description: `${productName} en taille ${variant.taille}, état ${variant.etat.toLowerCase()}`,
          seller_id: user.id
        }

        console.log(`📦 Variante ${index + 1} complète:`, {
          sku: variantData.sku,
          name: variantData.name,
          brand: variantData.brand,
          etat: variantData.etat,
          taille: variantData.taille,
          categorie: variantData.categorie,
          prix_eur: variantData.prix_eur,
          stock: variantData.stock,
          couleur: variantData.couleur,
          description: variantData.description
        })

        return variantData
      })

      console.log('💾 Insertion des variantes dans la base de données...')
      console.log('📋 Nombre de variantes à insérer:', variantInserts.length)
      console.log('📋 Première variante:', variantInserts[0])

      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantInserts)
        .select('sku, product_id, name, brand, etat, taille, categorie, prix_eur, stock, images, couleur, description, seller_id')

      console.log('📊 Résultat insertion variantes:')
      console.log('  -> data:', variantsData)
      console.log('  -> error:', variantsError)
      console.log('  -> error type:', typeof variantsError)

      if (variantsError) {
        console.error('❌ Erreur création variantes:', variantsError)
        console.error('📋 Type d\'erreur variantes:', typeof variantsError)
        if (variantsError && typeof variantsError === 'object') {
          console.error('📋 Clés d\'erreur variantes:', Object.keys(variantsError))
          console.error('📋 Valeurs d\'erreur variantes:', Object.values(variantsError))
        }
        throw variantsError
      }

      console.log('✅ Variantes créées avec succès')
      console.log('📋 Données insérées dans product_variants:', variantsData)
      console.log('🎉 Produit créé avec succès !')

      // Vérification finale en lisant les données insérées
      console.log('🔍 Vérification des données en base...')
      const { data: verifyData, error: verifyError } = await supabase
        .from('product_variants')
        .select('sku, product_id, name, brand, etat, taille, categorie, prix_eur, stock, images, couleur, description, seller_id')
        .eq('product_id', productId)

      if (!verifyError && verifyData) {
        console.log('✅ Vérification réussie - données en base:')
        verifyData.forEach((variant, index) => {
          console.log(`  Variante ${index + 1}:`, {
            sku: variant.sku,
            name: variant.name,
            brand: variant.brand,
            etat: variant.etat,
            taille: variant.taille,
            categorie: variant.categorie,
            prix_eur: variant.prix_eur,
            stock: variant.stock,
            couleur: variant.couleur,
            description: variant.description,
            seller_id: variant.seller_id
          })
        })
      }

      setCreatedProductId(productId)
      setSuccess(true)
      setTimeout(() => {
        router.push('/seller')
      }, 2000)

    } catch (err: any) {
      console.error('❌ Erreur complète:', err)
      console.error('📋 Type d\'erreur:', typeof err)
      console.error('📋 Erreur stringifiée:', JSON.stringify(err, null, 2))

      if (err && typeof err === 'object') {
        console.error('📋 Détails de l\'erreur:', {
          message: err.message,
          code: err.code,
          details: err.details,
          hint: err.hint,
          name: err.name,
          stack: err.stack
        })
      }

      // Gérer les cas où l'erreur est un objet vide
      if (!err || (typeof err === 'object' && Object.keys(err).length === 0)) {
        setError('Erreur de permissions : Vérifiez que les politiques RLS sont correctement configurées dans Supabase')
      } else {
        setError(err.message || 'Erreur lors de la création du produit')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthGuard requiredRole="vendeur">
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="max-w-md w-full text-center p-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Produit ajouté avec succès !
              </h2>
              <p className="text-green-700 mb-2">
                Votre produit "{productName}" a été créé avec l'identifiant unique :
              </p>
              <p className="text-green-600 font-mono text-sm bg-green-50 p-2 rounded">
                {createdProductId}
              </p>
              <p className="text-green-700 mt-2">
                Il est maintenant en ligne et visible par les clients.
                Redirection vers votre dashboard...
              </p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="vendeur">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* En-tête */}
          <div className="mb-8">
            <Link 
              href="/seller/products" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux produits
            </Link>
            <h1 className="text-3xl font-bold text-black">
              Ajouter un nouveau produit
            </h1>
            <p className="text-gray-600 mt-2">
              Remplissez les informations de votre chaussure pour la mettre en vente
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Informations générales */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-black mb-6">Informations générales</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    SKU du produit *
                  </label>
                  <input
                    type="text"
                    value={productSku}
                    onChange={(e) => setProductSku(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="ex: NIKE-AIR-FORCE-1-WHITE"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Identifiant unique du produit (lettres, chiffres et tirets uniquement).
                    Un identifiant unique sera généré automatiquement pour éviter les doublons.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="ex: Nike Air Force 1"
                    required
                  />
                </div>

                <ModernSelect
                  options={categoryOptions}
                  value={productCategory}
                  onChange={setProductCategory}
                  label="Catégorie"
                  placeholder="Sélectionner une catégorie"
                  required
                />

                <ModernSelect
                  options={brandOptions}
                  value={productBrand}
                  onChange={setProductBrand}
                  label="Marque"
                  placeholder="Sélectionner une marque"
                  required
                  allowOther
                  onOtherValue={handleCustomBrand}
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Description *
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Décrivez votre chaussure en détail..."
                  required
                />
              </div>

              {/* Sélecteur de couleurs simplifié */}
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur principale
                    </label>
                    <select
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">Sélectionner une couleur</option>
                      {availableColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur secondaire (optionnel)
                    </label>
                    <select
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">Aucune</option>
                      {availableColors.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Images du produit (max 5)
                </label>
                
                {/* Zone d'upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Cliquez pour ajouter des images
                        </span>
                        <input
                          id="image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="mt-2 text-xs text-gray-500">
                        PNG, JPG, WEBP jusqu'à 10MB chacune
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prévisualisation des images */}
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Prévisualisation ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadingImages && (
                  <div className="mt-4 flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Upload des images en cours...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Variantes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-black">Tailles et prix</h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-2 bg-transparent text-black border border-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une taille
                </button>
              </div>

              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-black">Variante {index + 1}</h3>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Taille *
                        </label>
                        <select
                          value={variant.taille || ''}
                          onChange={(e) => updateVariant(index, 'taille', parseInt(e.target.value || '40'))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          required
                        >
                          {sizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prix (€) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.prix_eur || ''}
                          onChange={(e) => updateVariant(index, 'prix_eur', parseFloat(e.target.value || '0'))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={variant.stock || ''}
                          onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value || '0'))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          État *
                        </label>
                        <select
                          value={variant.etat}
                          onChange={(e) => updateVariant(index, 'etat', e.target.value as 'NEUF' | 'SECONDE_MAIN')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          required
                        >
                          <option value="NEUF">Neuf</option>
                          <option value="SECONDE_MAIN">Seconde main</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Link
                href="/seller"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-transparent text-black border border-black rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Création...' : 'Créer le produit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}
