// Correction pour le problème de génération de SKU
// À appliquer dans src/app/seller/products/add/page.tsx

// PROBLÈME ACTUEL (ligne 337):
// sku: `${productId}-${variant.taille}-${variant.etat.toLowerCase()}`,

// SOLUTION - Remplacer par cette logique:

const generateVariantSku = (productId, productSku, variant) => {
  // Vérifier si le SKU utilisateur contient déjà la taille et l'état
  const skuLower = productSku.toLowerCase();
  const tailleLower = variant.taille.toString();
  const etatLower = variant.etat.toLowerCase().replace('_', '-');
  
  const containsTaille = skuLower.includes(tailleLower);
  const containsEtat = skuLower.includes('seconde-main') || skuLower.includes('neuf');
  
  // Si le SKU contient déjà taille et état, utiliser le productId tel quel
  if (containsTaille && containsEtat) {
    return productId; // Le SKU utilisateur est déjà complet
  }
  
  // Sinon, ajouter les éléments manquants
  let finalSku = productId;
  if (!containsTaille) {
    finalSku += `-${variant.taille}`;
  }
  if (!containsEtat) {
    finalSku += `-${variant.etat.toLowerCase()}`;
  }
  
  return finalSku;
};

// DANS LE CODE, remplacer:
// sku: `${productId}-${variant.taille}-${variant.etat.toLowerCase()}`,
// PAR:
// sku: generateVariantSku(productId, productSku, variant),

console.log('🔧 Solution pour éviter les doublons dans les SKU');
console.log('📋 Appliquez cette logique dans votre code pour résoudre le problème');

// TEST de la fonction
const testCases = [
  {
    productSku: 'NIKE-DUNK-LOW-36-SECONDE-MAIN',
    productId: 'NIKE-DUNK-LOW-36-SECONDE-MAIN-1695123456789-abc123',
    variant: { taille: 36, etat: 'SECONDE_MAIN' }
  },
  {
    productSku: 'NIKE-DUNK-LOW',
    productId: 'NIKE-DUNK-LOW-1695123456789-abc123', 
    variant: { taille: 42, etat: 'NEUF' }
  }
];

testCases.forEach((test, index) => {
  const result = generateVariantSku(test.productId, test.productSku, test.variant);
  console.log(`Test ${index + 1}:`);
  console.log(`  SKU utilisateur: ${test.productSku}`);
  console.log(`  SKU final généré: ${result}`);
  console.log('');
});
