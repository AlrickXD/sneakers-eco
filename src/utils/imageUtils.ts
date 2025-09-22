/**
 * Utilitaires pour gérer les images
 */

/**
 * Vérifie si une chaîne est une URL valide
 */
function isValidUrl(urlString: string): boolean {
  try {
    // Vérifier que ce n'est pas "nan", "null", "undefined", etc.
    if (!urlString || 
        urlString.toLowerCase() === 'nan' || 
        urlString.toLowerCase() === 'null' || 
        urlString.toLowerCase() === 'undefined' ||
        urlString.length < 4) {
      return false
    }
    
    // Vérifier que ça commence par http ou https
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      return false
    }
    
    // Tenter de créer une URL pour valider
    new URL(urlString)
    return true
  } catch {
    return false
  }
}

/**
 * Nettoie une URL d'image en supprimant les espaces et caractères de contrôle
 */
export function cleanImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  
  const cleaned = url.trim()
  return isValidUrl(cleaned) ? cleaned : undefined
}

/**
 * Nettoie un tableau d'URLs d'images séparées par un délimiteur
 */
export function cleanImageUrls(imageString: string | undefined | null, delimiter = '|'): string[] {
  if (!imageString) return []
  
  return imageString
    .split(delimiter)
    .map(url => url.trim())
    .filter(url => url && isValidUrl(url))
}

/**
 * Récupère la première image nettoyée d'une chaîne d'images
 */
export function getFirstImage(imageString: string | undefined | null, delimiter = '|'): string | undefined {
  const images = cleanImageUrls(imageString, delimiter)
  return images[0]
}

/**
 * Vérifie si un produit a au moins une image valide (produit ou variantes)
 */
export function hasValidImages(product: any, variants: any[] = []): boolean {
  // Vérifier les images du produit principal
  const productImages = cleanImageUrls(product.images)
  if (productImages.length > 0) {
    return true
  }
  
  // Vérifier les images des variantes
  if (variants && variants.length > 0) {
    return variants.some(variant => {
      const variantImages = cleanImageUrls(variant.images)
      return variantImages.length > 0
    })
  }
  
  return false
}
