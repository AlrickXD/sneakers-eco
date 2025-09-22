-- =====================================================
-- TEST SIMPLE : Compatible avec Supabase
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
  -- Insérer le produit
  INSERT INTO products (product_id, name, categorie, description, images, seller_id)
  VALUES (test_product_id, 'Simple Test Product', 'Homme', 'Simple Test', 'test.jpg', auth.uid());

  -- Insérer la variante
  INSERT INTO product_variants (
    sku, product_id, name, etat, taille, categorie,
    prix_eur, stock, images, couleur, description, seller_id
  ) VALUES (
    test_sku, test_product_id, 'Simple Test Variant', 'NEUF', 40, 'Homme',
    100.00, 1, 'test.jpg', 'BLANC', 'Simple Test', auth.uid()
  );

  -- Nettoyer
  DELETE FROM product_variants WHERE product_id = test_product_id;
  DELETE FROM products WHERE product_id = test_product_id;
END;
$$;

-- =====================================================
-- NOTES :
-- - Version compatible avec Supabase
-- - Test simple et direct
-- - Pas de syntaxe problématique
-- - Compatible avec votre structure DB
-- =====================================================
