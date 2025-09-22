-- =====================================================
-- DIAGNOSTIC CORRECT : Basé sur la structure DB réelle
-- =====================================================

-- 1. Vérifier l'utilisateur connecté
SELECT
  '=== UTILISATEUR ===' as section,
  auth.uid() as user_id,
  CASE WHEN auth.uid() IS NOT NULL THEN 'AUTHENTIFIÉ' ELSE 'NON AUTHENTIFIÉ' END as status;

-- 2. Vérifier les colonnes disponibles dans profiles
SELECT
  '=== STRUCTURE PROFILES ===' as section,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Vérifier le profil utilisateur
SELECT
  '=== PROFIL UTILISATEUR ===' as section,
  id,
  role,
  display_name,
  created_at
FROM profiles
WHERE id = auth.uid();

-- 4. Vérifier les politiques RLS
SELECT
  '=== POLITIQUES RLS ===' as section,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('products', 'product_variants')
ORDER BY tablename, policyname;

-- 5. Tester les permissions d'insertion
SELECT
  '=== TEST INSERTION ===' as section;

-- Test simple d'insertion
DO $$
DECLARE
  test_product_id TEXT := 'DIAG-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  result TEXT;
BEGIN
  -- Test insertion produit
  BEGIN
    INSERT INTO products (product_id, name, categorie, description, images, seller_id)
    VALUES (test_product_id, 'Diag Test Product', 'Homme', 'Test', 'test.jpg', auth.uid());

    RAISE NOTICE '✅ Insertion dans products RÉUSSIE';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ Insertion dans products ÉCHOUÉE: %', SQLERRM;
  END;

  -- Nettoyer
  DELETE FROM products WHERE product_id = test_product_id;
END;
$$;

-- 6. Vérifier les contraintes
SELECT
  '=== CONTRAINTES ===' as section,
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('products', 'product_variants')
ORDER BY tc.table_name, tc.constraint_name;

-- 7. Vérifier les permissions
SELECT
  '=== PERMISSIONS ===' as section,
  table_name,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('products', 'product_variants')
ORDER BY table_name, grantee;

-- =====================================================
-- NOTES :
-- - Basé sur la structure DB réelle de votre projet
-- - Compatible avec profiles (id, role, display_name, created_at)
-- - Compatible avec products (product_id, name, categorie, description, images, seller_id)
-- - Compatible avec product_variants (sku, product_id, name, brand, etat, taille, etc.)
-- =====================================================
