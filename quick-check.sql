-- =====================================================
-- DIAGNOSTIC RAPIDE : État de la base de données
-- =====================================================

-- 1. Vérifier l'utilisateur connecté
SELECT
  '=== UTILISATEUR ===' as section,
  auth.uid() as user_id,
  CASE WHEN auth.uid() IS NOT NULL THEN 'CONNECTÉ' ELSE 'DÉCONNECTÉ' END as status;

-- 2. Compter les produits existants
SELECT
  '=== PRODUITS ===' as section,
  COUNT(*) as total_produits
FROM products;

-- 3. Compter les variantes existantes
SELECT
  '=== VARIANTES ===' as section,
  COUNT(*) as total_variantes
FROM product_variants;

-- 4. Vérifier les politiques RLS
SELECT
  '=== POLITIQUES ===' as section,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('products', 'product_variants')
ORDER BY tablename;

-- 5. Tester la lecture des produits
SELECT
  '=== LECTURE PRODUITS ===' as section;

DO $$
DECLARE
  product_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM products;

  IF product_count = 0 THEN
    RAISE NOTICE 'Aucun produit trouvé - c''est normal si vous n''avez pas encore créé de produits';
  ELSE
    RAISE NOTICE '% produits trouvés', product_count;
  END IF;
END;
$$;

-- 6. Tester l'insertion d'un produit de test
SELECT
  '=== TEST INSERTION ===' as section;

DO $$
DECLARE
  test_product_id TEXT := 'QUICK-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  test_sku TEXT := 'QUICK-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
  -- Test rapide
  INSERT INTO products (product_id, name, categorie, seller_id)
  VALUES (test_product_id, 'Test Rapide', 'Homme', auth.uid());

  INSERT INTO product_variants (
    sku, product_id, name, etat, taille, categorie, prix_eur, stock, seller_id
  ) VALUES (
    test_sku, test_product_id, 'Test Rapide Variante', 'NEUF', 40, 'Homme', 50.00, 1, auth.uid()
  );

  RAISE NOTICE '✅ Test d''insertion réussi';

  -- Nettoyer
  DELETE FROM product_variants WHERE product_id = test_product_id;
  DELETE FROM products WHERE product_id = test_product_id;

  RAISE NOTICE '✅ Nettoyage réussi';
END;
$$;

-- =====================================================
-- NOTES :
-- - Diagnostic rapide de l'état de la DB
-- - Vérifie les produits existants
-- - Test d'insertion simple
-- - Compatible avec Supabase
-- =====================================================
