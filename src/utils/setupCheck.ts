import { supabase } from '@/lib/supabase'

/**
 * Vérifie si la base de données est correctement configurée
 */
export async function checkDatabaseSetup(): Promise<{
  isSetup: boolean
  errors: string[]
  warnings: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Vérifier si la table profiles existe
    const { error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (profilesError) {
      if (profilesError.code === '42P01') {
        errors.push('Table "profiles" non trouvée. Veuillez exécuter les migrations SQL.')
      } else {
        errors.push(`Erreur table profiles: ${profilesError.message}`)
      }
    }

    // Vérifier si la table products existe et contient des données
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('product_id')
      .limit(1)

    if (productsError) {
      if (productsError.code === '42P01') {
        errors.push('Table "products" non trouvée. Vérifiez que les données sont bien présentes.')
      } else {
        errors.push(`Erreur table products: ${productsError.message}`)
      }
    } else if (!products || products.length === 0) {
      warnings.push('Aucun produit trouvé. Ajoutez des produits pour tester l\'application.')
    }

    // Vérifier si la table product_variants existe
    const { error: variantsError } = await supabase
      .from('product_variants')
      .select('sku')
      .limit(1)

    if (variantsError) {
      if (variantsError.code === '42P01') {
        errors.push('Table "product_variants" non trouvée. Vérifiez que les données sont bien présentes.')
      } else {
        errors.push(`Erreur table product_variants: ${variantsError.message}`)
      }
    }

    // Vérifier si la fonction decrement_stock_by_sku existe
    try {
      const { error: functionError } = await supabase.rpc('decrement_stock_by_sku', {
        p_sku: 'test',
        p_qty: 0
      })

      // Si la fonction n'existe pas, on aura une erreur 42883
      if (functionError && functionError.code === '42883') {
        errors.push('Fonction "decrement_stock_by_sku" non trouvée. Exécutez les migrations SQL.')
      }
    } catch (e) {
      // Ignorer les erreurs de test
    }

    return {
      isSetup: errors.length === 0,
      errors,
      warnings
    }

  } catch (error) {
    return {
      isSetup: false,
      errors: [`Erreur de connexion à la base de données: ${error}`],
      warnings: []
    }
  }
}

/**
 * Affiche un message d'aide pour la configuration
 */
export function getSetupInstructions(): string {
  return `
🔧 Configuration requise :

1. Exécuter les migrations SQL :
   - Aller sur Supabase Dashboard → SQL Editor
   - Copier le contenu de supabase.sql
   - Exécuter la requête

2. Vérifier les variables d'environnement :
   - SUPABASE_SERVICE_ROLE_KEY doit être définie
   - Toutes les clés Supabase et Stripe doivent être présentes

3. Ajouter des données de test :
   - Insérer des produits dans la table products
   - Ajouter des variantes dans product_variants

Voir SETUP.md pour les instructions détaillées.
  `
}


