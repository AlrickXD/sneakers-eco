-- =====================================================
-- DÉBOGAGE DES COLONNES PRODUCT_VARIANTS
-- =====================================================

-- 1. Vérifier la structure complète de product_variants
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'product_variants'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes sur product_variants
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS referenced_table,
  ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'product_variants'
ORDER BY tc.constraint_name;

-- 3. Vérifier les index sur product_variants
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'product_variants';

-- 4. Afficher quelques exemples de données existantes
SELECT
  sku,
  product_id,
  name,
  brand,
  etat,
  taille,
  categorie,
  prix_eur,
  stock,
  couleur,
  description
FROM product_variants
LIMIT 5;

-- 5. Compter les variantes par produit
SELECT
  product_id,
  COUNT(*) as variant_count,
  STRING_AGG(DISTINCT brand, ', ') as brands,
  STRING_AGG(DISTINCT etat, ', ') as etats,
  STRING_AGG(DISTINCT categorie, ', ') as categories,
  STRING_AGG(DISTINCT couleur, ', ') as couleurs
FROM product_variants
GROUP BY product_id
ORDER BY variant_count DESC
LIMIT 10;

-- 6. Vérifier les politiques RLS
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'product_variants'
ORDER BY policyname;

-- =====================================================
-- RÉSULTATS ATTENDUS :
-- - Colonnes brand, couleur doivent exister
-- - Contraintes appropriées sur les colonnes
-- - Politiques RLS correctes
-- - Données d'exemple avec valeurs non-nulles
-- =====================================================
