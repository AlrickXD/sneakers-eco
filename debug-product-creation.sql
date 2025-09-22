-- =====================================================
-- DEBUG : Création de produits - Diagnostic complet
-- =====================================================

-- 1. Vérifier les politiques RLS sur products et product_variants
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('products', 'product_variants')
ORDER BY tablename, policyname;

-- 2. Vérifier les contraintes sur les tables
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('products', 'product_variants')
ORDER BY tc.table_name, tc.constraint_name;

-- 3. Vérifier les colonnes des tables
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('products', 'product_variants')
ORDER BY table_name, ordinal_position;

-- 4. Tester l'insertion d'un produit de test
-- (REMPLACEZ les valeurs par vos valeurs de test)
INSERT INTO products (product_id, name, categorie, description, images, seller_id)
VALUES (
  'TEST-PRODUCT-12345',
  'Test Product',
  'Homme',
  'Test description',
  'https://example.com/image.jpg',
  (SELECT id FROM auth.users LIMIT 1)
);

-- 5. Tester l'insertion d'une variante de test
-- (REMPLACEZ les valeurs par vos valeurs de test)
INSERT INTO product_variants (
  sku, product_id, name, brand, etat, taille, categorie,
  prix_eur, stock, images, couleur, description, seller_id
) VALUES (
  'TEST-SKU-12345',
  'TEST-PRODUCT-12345',
  'Test Variant',
  'Nike',
  'NEUF',
  40,
  'Homme',
  100.00,
  1,
  'https://example.com/image.jpg',
  'BLANC',
  'Test description',
  (SELECT id FROM auth.users LIMIT 1)
);

-- 6. Vérifier les erreurs potentielles
SELECT
  'products' as table_name,
  COUNT(*) as count
FROM products
UNION ALL
SELECT
  'product_variants' as table_name,
  COUNT(*) as count
FROM product_variants;

-- =====================================================
-- NOTES :
-- - Vérifie les politiques RLS qui peuvent bloquer l'insertion
-- - Vérifie les contraintes de clés étrangères
-- - Teste l'insertion de données de test
-- - Vérifie le nombre d'enregistrements existants
-- =====================================================
