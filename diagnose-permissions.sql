-- =====================================================
-- DIAGNOSTIC : Permissions et structure
-- =====================================================

-- 1. Vérifier l'utilisateur actuel
SELECT
  auth.uid() as current_user_id,
  auth.jwt() ->> 'email' as current_user_email;

-- 2. Vérifier le profil de l'utilisateur
SELECT
  id,
  email,
  role,
  created_at
FROM profiles
WHERE id = auth.uid();

-- 3. Tester les permissions d'insertion dans products
-- (Cette requête devrait échouer avec une erreur claire si les permissions sont mal configurées)
INSERT INTO products (product_id, name, categorie, description, images, seller_id)
VALUES (
  'TEST-PERMISSION-CHECK',
  'Permission Test',
  'Homme',
  'Test description',
  'test.jpg',
  auth.uid()
);

-- 4. Tester les permissions d'insertion dans product_variants
-- (Cette requête devrait échouer avec une erreur claire si les permissions sont mal configurées)
INSERT INTO product_variants (
  sku, product_id, name, etat, taille, categorie,
  prix_eur, stock, images, couleur, description, seller_id
) VALUES (
  'TEST-VARIANT-PERMISSION',
  'TEST-PERMISSION-CHECK',
  'Permission Test Variant',
  'NEUF',
  40,
  'Homme',
  100.00,
  1,
  'test.jpg',
  'BLANC',
  'Test description',
  auth.uid()
);

-- 5. Vérifier les politiques RLS actives
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
  AND cmd IN ('INSERT', 'ALL')
ORDER BY tablename, policyname;

-- 6. Vérifier les contraintes de clés étrangères
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
LEFT JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name IN ('products', 'product_variants')
ORDER BY tc.table_name, tc.constraint_name;

-- =====================================================
-- NOTES :
-- - Vérifie l'utilisateur connecté et son profil
-- - Teste les permissions d'insertion
-- - Affiche les politiques RLS actives
-- - Vérifie les contraintes de clés étrangères
-- =====================================================
