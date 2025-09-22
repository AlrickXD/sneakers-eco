-- =====================================================
-- DIAGNOSTIC : Problèmes spécifiques de création de produits
-- =====================================================

-- 1. Vérifier les colonnes manquantes dans product_variants
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'product_variants'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes NOT NULL
SELECT
  table_name,
  column_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'product_variants'
  AND is_nullable = 'NO'
ORDER BY table_name, ordinal_position;

-- 3. Tester l'insertion avec des données minimales
-- (Exécuter en tant qu'utilisateur authentifié vendeur)
INSERT INTO products (
  product_id,
  name,
  categorie,
  description,
  images,
  seller_id
)
SELECT
  'TEST-PRODUCT-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'Test Product',
  'Homme',
  'Test description',
  'test.jpg',
  auth.uid()
WHERE auth.uid() IS NOT NULL;

-- 4. Tester l'insertion de variante avec données minimales
INSERT INTO product_variants (
  sku,
  product_id,
  name,
  etat,
  taille,
  categorie,
  prix_eur,
  stock,
  seller_id
)
SELECT
  'TEST-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'TEST-PRODUCT-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'Test Variant',
  'NEUF',
  40,
  'Homme',
  100.00,
  1,
  auth.uid()
WHERE auth.uid() IS NOT NULL;

-- 5. Vérifier les erreurs de permissions
SELECT
  'Test insertion products' as test,
  CASE WHEN auth.uid() IS NOT NULL THEN 'OK' ELSE 'PAS AUTH' END as auth_status,
  CASE WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vendeur') THEN 'OK' ELSE 'PAS VENDEUR' END as profile_status;

-- =====================================================
-- NOTES :
-- - Vérifie les colonnes obligatoires
-- - Teste l'insertion avec données minimales
-- - Vérifie le statut d'authentification
-- - Teste les permissions RLS
-- =====================================================
