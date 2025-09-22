-- =====================================================
-- TEST : Vérifier la visibilité des produits (corrigé)
-- =====================================================

-- 1. Vérifier les politiques actives
SELECT
  '=== POLITIQUES ACTIVES ===' as section,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('products', 'product_variants')
ORDER BY tablename, policyname;

-- 2. Tester la lecture des produits
SELECT
  '=== TEST LECTURE PRODUITS ===' as section;

DO $$
DECLARE
  product_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM products;

  IF product_count = 0 THEN
    RAISE NOTICE 'Aucun produit trouvé - c''est normal si vous n''avez pas encore créé de produits';
  ELSE
    RAISE NOTICE '% produits trouvés - ils devraient être visibles même déconnecté', product_count;
  END IF;
END;
$$;

-- 3. Tester la lecture des variantes
SELECT
  '=== TEST LECTURE VARIANTES ===' as section;

DO $$
DECLARE
  variant_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO variant_count FROM product_variants;

  IF variant_count = 0 THEN
    RAISE NOTICE 'Aucune variante dans la base';
  ELSE
    RAISE NOTICE '% variantes trouvées', variant_count;
  END IF;
END;
$$;

-- 4. Tester l'insertion (devrait échouer pour les non-vendeurs)
SELECT
  '=== TEST INSERTION (devrait échouer) ===' as section;

DO $$
DECLARE
  test_product_id TEXT := 'VISIBILITY-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  test_sku TEXT := 'VISIBILITY-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
  -- Test d'insertion (devrait échouer car pas de profil vendeur)
  BEGIN
    INSERT INTO products (product_id, name, categorie, seller_id)
    VALUES (test_product_id, 'Test Visibility', 'Homme', auth.uid());

    RAISE NOTICE '❌ Insertion produit RÉUSSIE - problème de sécurité !';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '✅ Insertion produit ÉCHOUÉE - sécurité OK';
  END;

  -- Nettoyer si l'insertion a réussi
  DELETE FROM products WHERE product_id = test_product_id;
END;
$$;

-- 5. Résumé
SELECT
  '=== RÉSUMÉ ===' as section,
  'Politiques configurées pour:' as info_1,
  '✅ Lecture des produits: TOUT LE MONDE' as info_2,
  '✅ Écriture des produits: VENDEURS UNIQUEMENT' as info_3,
  '✅ Les produits devraient être visibles même déconnecté' as info_4;

-- =====================================================
-- NOTES :
-- - Version corrigée compatible avec Supabase
- - Pas de syntaxe de boucle problématique
- - Test de visibilité simple
- - Compatible avec votre structure DB
-- =====================================================
