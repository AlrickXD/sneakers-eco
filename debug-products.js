// Script de débogage pour tester la connexion Supabase
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://odnixinsfjmvoppzgpoh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kbml4aW5zZmptdm9wcHpncG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzgzMTAsImV4cCI6MjA3Mzk1NDMxMH0.9TIHrD9Hqp328z5x5LtcPhCuquY6iUOy77cKNxA1HoA'
)

async function testConnection() {
  try {
    console.log('🔍 Test de connexion Supabase...')
    
    // Test 1: Compter les produits
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('product_id, name')
      .limit(5)
    
    if (productsError) {
      console.error('❌ Erreur produits:', productsError)
      return
    }
    
    console.log(`✅ ${products?.length || 0} produits trouvés:`)
    products?.forEach(p => console.log(`  - ${p.name} (${p.product_id})`))
    
    // Test 2: Compter les variantes
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('sku, name, stock')
      .limit(5)
    
    if (variantsError) {
      console.error('❌ Erreur variantes:', variantsError)
      return
    }
    
    console.log(`✅ ${variants?.length || 0} variantes trouvées:`)
    variants?.forEach(v => console.log(`  - ${v.name} (stock: ${v.stock})`))
    
    // Test 3: Vérifier les permissions
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(1)
    
    if (profilesError) {
      console.error('❌ Erreur profiles:', profilesError)
    } else {
      console.log(`✅ Profiles accessibles: ${profiles?.length || 0}`)
    }
    
    console.log('\n🎯 Résumé:')
    console.log(`  - Produits: ${products?.length || 0}`)
    console.log(`  - Variantes: ${variants?.length || 0}`)
    console.log(`  - Profiles: ${profiles?.length || 0}`)
    
  } catch (error) {
    console.error('💥 Erreur générale:', error)
  }
}

testConnection()


