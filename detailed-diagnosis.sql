-- =====================================================
-- DIAGNOSTIC DÉTAILLÉ : Identifier le problème exact
-- =====================================================

-- 1. Vérifier l'utilisateur connecté
SELECT
  '=== 1. UTILISATEUR CONNECTÉ ===' as section;

SELECT
  auth.uid() as user_id,
  auth.jwt() ->> 'email' as user_email,
  CASE WHEN auth.uid() IS NOT NULL THEN 'AUTHENTIFIÉ' ELSE 'NON AUTHENTIFIÉ' END as auth_status;

-- 2. Vérifier le profil utilisateur
SELECT
  '=== 2. PROFIL UTILISATEUR ===' as section;

SELECT
  id,
  role,
  display_name,
  created_at
FROM profiles
WHERE id = auth.uid();

-- 3. Vérifier les politiques RLS actives
SELECT
  '=== 3. POLITIQUES RLS ===' as section;

SELECT
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

-- 4. Tester l'insertion de produit étape par étape
SELECT
  '=== 4. TEST INSERTION PRODUIT ===' as section;

DO $$
DECLARE
  test_product_id TEXT := 'DETAIL-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  result TEXT;
BEGIN
  -- Test 1: Vérifier les permissions de base
  BEGIN
    SELECT 'Test 1 - Permissions de base' as test_step;
    INSERT INTO products (product_id, name, categorie, description, images, seller_id)
    VALUES (test_product_id, 'Detail Test Product', 'Homme', 'Detail Test', 'test.jpg', auth.uid());
    result := '✅ Insertion produit RÉUSSIE';
  EXCEPTION
    WHEN OTHERS THEN
    result := '❌ Insertion produit ÉCHOUÉE: ' || SQLERRM;
  END;

  RAISE NOTICE '%', result;

  -- Si le produit a été inséré, le nettoyer
  IF result LIKE '✅%' THEN
    DELETE FROM products WHERE product_id = test_product_id;
    RAISE NOTICE '✅ Nettoyage produit de test réussi';
  END IF;

END;
$$;

-- 5. Tester l'insertion de variante étape par étape
SELECT
  '=== 5. TEST INSERTION VARIANTE ===' as section;

DO $$
DECLARE
  test_product_id TEXT := 'DETAIL-PRODUCT-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  test_sku TEXT := 'DETAIL-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  result TEXT;
BEGIN
  -- Créer d'abord le produit
  INSERT INTO products (product_id, name, categorie, description, images, seller_id)
  VALUES (test_product_id, 'Detail Test Product', 'Homme', 'Detail Test', 'test.jpg', auth.uid());

  -- Test 2: Vérifier l'insertion de variante
  BEGIN
    SELECT 'Test 2 - Insertion variante' as test_step;
    INSERT INTO product_variants (
      sku, product_id, name, etat, taille, categorie,
      prix_eur, stock, images, couleur, description, seller_id
    ) VALUES (
      test_sku, test_product_id, 'Detail Test Variant', 'NEUF', 40, 'Homme',
      100.00, 1, 'test.jpg', 'BLANC', 'Detail Test', auth.uid()
    );
    result := '✅ Insertion variante RÉUSSIE';
  EXCEPTION
    WHEN OTHERS THEN
    result := '❌ Insertion variante ÉCHOUÉE: ' || SQLERRM;
  END;

  RAISE NOTICE '%', result;

  -- Nettoyer
  DELETE FROM product_variants WHERE product_id = test_product_id;
  DELETE FROM products WHERE product_id = test_product_id;

  IF result LIKE '✅%' THEN
    RAISE NOTICE '✅ Nettoyage variante de test réussi';
  ELSE
    RAISE NOTICE '❌ Nettoyage non nécessaire (insertion échouée)';
  END IF;

END;
$$;

-- 6. Vérifier les contraintes et permissions
SELECT
  '=== 6. CONTRAINTES ET PERMISSIONS ===' as section;

-- Vérifier les contraintes sur products
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
WHERE tc.table_name = 'products'
ORDER BY tc.constraint_name;

-- Vérifier les contraintes sur product_variants
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
WHERE tc.table_name = 'product_variants'
ORDER BY tc.constraint_name;

-- 7. Vérifier les permissions
SELECT
  '=== 7. PERMISSIONS ===' as section;

SELECT
  table_name,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('products', 'product_variants')
ORDER BY table_name, grantee, privilege_type;

-- 8. Tester avec des données minimales
SELECT
  '=== 8. TEST DONNÉES MINIMALES ===' as section;

DO $$
DECLARE
  test_product_id TEXT := 'MINIMAL-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  test_sku TEXT := 'MINIMAL-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  result TEXT;
BEGIN
  -- Test avec données minimales
  BEGIN
    SELECT 'Test 3 - Données minimales' as test_step;

    -- Produit avec seulement les colonnes obligatoires
    INSERT INTO products (product_id, name, categorie, seller_id)
    VALUES (test_product_id, 'Minimal Test Product', 'Homme', auth.uid());

    -- Variante avec seulement les colonnes obligatoires
    INSERT INTO product_variants (
      sku, product_id, name, etat, taille, categorie, prix_eur, stock, seller_id
    ) VALUES (
      test_sku, test_product_id, 'Minimal Test Variant', 'NEUF', 40, 'Homme', 100.00, 1, auth.uid()
    );

    result := '✅ Insertion minimale RÉUSSIE';
  EXCEPTION
    WHEN OTHERS THEN
    result := '❌ Insertion minimale ÉCHOUÉE: ' || SQLERRM;
  END;

  RAISE NOTICE '%', result;

  -- Nettoyer
  DELETE FROM product_variants WHERE product_id = test_product_id;
  DELETE FROM products WHERE product_id = test_product_id;

  IF result LIKE '✅%' THEN
    RAISE NOTICE '✅ Nettoyage test minimal réussi';
  END IF;

END;
$$;

-- 9. Résumé final
SELECT
  '=== 9. RÉSUMÉ ===' as section,
  'Script diagnostic détaillé exécuté avec succès' as status;

-- =====================================================
-- NOTES :
-- - Diagnostic étape par étape avec gestion d'erreurs
-- - Test d'insertion avec données minimales
-- - Identification exacte du problème
-- - Compatible avec Supabase
-- =====================================================
