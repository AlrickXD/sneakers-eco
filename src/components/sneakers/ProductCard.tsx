import Image from 'next/image'
import Link from 'next/link'
import { Product, ProductVariant } from '@/types/database'
import { getFirstImage } from '@/utils/imageUtils'

interface ProductCardProps {
  product: Product
  variants: ProductVariant[]
}

export function ProductCard({ product, variants }: ProductCardProps) {
  // Calculer le prix minimum pour les variantes en stock
  const newVariants = variants.filter(v => v.etat === 'NEUF' && v.stock > 0)
  const secondhandVariants = variants.filter(v => v.etat === 'SECONDE_MAIN' && v.stock > 0)
  
  const minPrice = Math.min(...variants.filter(v => v.stock > 0).map(v => v.prix_eur))
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0)
  
  // Image principale (première image du produit ou de la première variante)
  const mainImage = getFirstImage(product.images) || getFirstImage(variants[0]?.images)

  return (
    <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/p/${product.product_id}`}>
        <div className="aspect-square relative bg-gray-50">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-lg">Pas d&apos;image</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {newVariants.length > 0 && (
              <span className="bg-black text-white text-xs px-2 py-1 rounded">
                NEUF
              </span>
            )}
            {secondhandVariants.length > 0 && (
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                SECONDE MAIN
              </span>
            )}
          </div>

          {/* Stock faible - Masqué pour produits uniquement seconde main */}
          {totalStock <= 2 && totalStock > 0 && newVariants.length > 0 && (
            <div className="absolute top-3 right-3">
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                Plus que {totalStock}
              </span>
            </div>
          )}

          {/* Rupture de stock */}
          {totalStock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded font-medium">
                Rupture de stock
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Nom et catégorie */}
          <h3 className="font-semibold text-lg text-black group-hover:text-gray-700 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2">{product.categorie}</p>

          {/* Prix */}
          <div className="mb-3">
            <span className="text-xl font-bold text-black">
              À partir de {minPrice.toFixed(2)} €
            </span>
          </div>


          {/* CTA */}
          <div className="flex items-center justify-end">
            <span className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-gray-800 transition-colors">
              Voir
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}