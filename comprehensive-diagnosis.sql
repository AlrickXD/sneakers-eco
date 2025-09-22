-- =====================================================
-- DIAGNOSTIC COMPLÈTE : Identifier le problème exact
-- =====================================================

-- 1. Vérifier l'utilisateur connecté et son profil
SELECT
  '=== UTILISATEUR ===' as section;

SELECT
  auth.uid() as user_id,
  auth.jwt() ->> 'email' as email,
  CASE WHEN auth.uid() IS NOT NULL THEN 'AUTHENTIFIÉ' ELSE 'NON AUTHENTIFIÉ' END as status;

SELECT
  'Profil:' as info,
  id,
  email,
  role,
  created_at
FROM profiles
WHERE id = auth.uid();

-- 2. Vérifier les politiques RLS actives
SELECT
  '=== POLITIQUES RLS ===' as section;

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

-- 3. Tester les permissions d'insertion étape par étape
SELECT
  '=== TEST PERMISSIONS ===' as section;

-- Test 1: Vérifier si on peut insérer dans products
DO $$
DECLARE
  test_product_id TEXT := 'TEST-DIAG-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  result TEXT;
BEGIN
  BEGIN
    INSERT INTO products (product_id, name, categorie, description, images, seller_id)
    VALUES (test_product_id, 'Test Product', 'Homme', 'Test', 'test.jpg', auth.uid());

    result := '✅ Insertion dans products RÉUSSIE';
    RAISE NOTICE '%', result;

  EXCEPTION
    WHEN OTHERS THEN
      result := '❌ Insertion dans products ÉCHOUÉE: ' || SQLERRM;
      RAISE NOTICE '%', result;
  END;

  -- Nettoyer le test
  DELETE FROM products WHERE product_id = test_product_id;
END;
$$;

-- Test 2: Vérifier si on peut insérer dans product_variants
DO $$
DECLARE
  test_product_id TEXT := 'TEST-DIAG-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  test_sku TEXT := 'TEST-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  result TEXT;
BEGIN
  -- Créer d'abord le produit
  INSERT INTO products (product_id, name, categorie, description, images, seller_id)
  VALUES (test_product_id, 'Test Product', 'Homme', 'Test', 'test.jpg', auth.uid());

  BEGIN
    INSERT INTO product_variants (
      sku, product_id, name, etat, taille, categorie,
      prix_eur, stock, images, couleur, description, seller_id
    ) VALUES (
      test_sku, test_product_id, 'Test Variant', 'NEUF', 40, 'Homme',
      100.00, 1, 'test.jpg', 'BLANC', 'Test', auth.uid()
    );

    result := '✅ Insertion dans product_variants RÉUSSIE';
    RAISE NOTICE '%', result;

  EXCEPTION
    WHEN OTHERS THEN
      result := '❌ Insertion dans product_variants ÉCHOUÉE: ' || SQLERRM;
      RAISE NOTICE '%', result;
  END;

  -- Nettoyer les tests
  DELETE FROM product_variants WHERE product_id = test_product_id;
  DELETE FROM products WHERE product_id = test_product_id;
END;
$$;

-- 4. Vérifier les contraintes de clés étrangères
SELECT
  '=== CONTRAINTES ===' as section;

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

-- 5. Vérifier les permissions sur les tables
SELECT
  '=== PERMISSIONS ===' as section;

SELECT
  schemaname,
  tablename,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE tablename IN ('products', 'product_variants')
  AND grantee IN ('authenticated', 'anon', CURRENT_USER)
ORDER BY tablename, grantee, privilege_type;

-- =====================================================
-- NOTES :
-- - Diagnostic complet avec tests d'insertion
-- - Identifie exactement où se situe le problème
-- - Nettoie automatiquement les données de test
-- =====================================================
