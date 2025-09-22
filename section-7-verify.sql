-- === SECTION 7: Vérifier la correction ===
SELECT
  '=== POLITIQUE FINALE ===' as section,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename IN ('products', 'product_variants');

-- Test final
DO $$
DECLARE
  test_product_id TEXT := 'FINAL-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  test_sku TEXT := 'FINAL-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
  INSERT INTO products (product_id, name, categorie, seller_id)
  VALUES (test_product_id, 'Final Test', 'Homme', auth.uid());

  INSERT INTO product_variants (
    sku, product_id, name, etat, taille, categorie, prix_eur, stock, seller_id
  ) VALUES (
    test_sku, test_product_id, 'Final Test Variant', 'NEUF', 40, 'Homme', 100.00, 1, auth.uid()
  );

  RAISE NOTICE '✅ Test final réussi';

  DELETE FROM product_variants WHERE product_id = test_product_id;
  DELETE FROM products WHERE product_id = test_product_id;
END;
$$;
