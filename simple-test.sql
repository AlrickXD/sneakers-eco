-- =====================================================
-- TEST SIMPLE : Vérifier l'état actuel
-- =====================================================

-- 1. Vérifier l'utilisateur connecté
SELECT
  'Utilisateur connecté:' as info,
  auth.uid() as user_id,
  CASE WHEN auth.uid() IS NOT NULL THEN 'AUTHENTIFIÉ' ELSE 'NON AUTHENTIFIÉ' END as status;

-- 2. Vérifier les politiques actives
SELECT
  'Politiques actives:' as info,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('products', 'product_variants')
ORDER BY tablename, policyname;

-- 3. Tester l'insertion simple
DO $$
DECLARE
  test_product_id TEXT := 'SIMPLE-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  test_sku TEXT := 'SIMPLE-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
  -- Test simple sans gestion d'erreur complexe
  INSERT INTO products (product_id, name, categorie, description, images, seller_id)
  VALUES (test_product_id, 'Simple Test Product', 'Homme', 'Simple Test', 'test.jpg', auth.uid());

  RAISE NOTICE '✅ Produit inséré avec succès';

  INSERT INTO product_variants (
    sku, product_id, name, etat, taille, categorie,
    prix_eur, stock, images, couleur, description, seller_id
  ) VALUES (
    test_sku, test_product_id, 'Simple Test Variant', 'NEUF', 40, 'Homme',
    100.00, 1, 'test.jpg', 'BLANC', 'Simple Test', auth.uid()
  );

  RAISE NOTICE '✅ Variante insérée avec succès';

  -- Nettoyer
  DELETE FROM product_variants WHERE product_id = test_product_id;
  DELETE FROM products WHERE product_id = test_product_id;

  RAISE NOTICE '✅ Test simple réussi';
END;
$$;

-- =====================================================
-- NOTES :
-- - Test simple et direct
-- - Pas de références à des colonnes inexistantes
-- - Vérifie l'état actuel des politiques
-- - Test d'insertion basique
-- =====================================================
