-- === SECTION 5: Tester l'insertion ===
DO $$
DECLARE
  test_product_id TEXT := 'TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  test_sku TEXT := 'SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
  -- Test d'insertion
  INSERT INTO products (product_id, name, categorie, seller_id)
  VALUES (test_product_id, 'Test Product', 'Homme', auth.uid());

  INSERT INTO product_variants (
    sku, product_id, name, etat, taille, categorie, prix_eur, stock, seller_id
  ) VALUES (
    test_sku, test_product_id, 'Test Variant', 'NEUF', 40, 'Homme', 100.00, 1, auth.uid()
  );

  RAISE NOTICE '✅ Test d''insertion réussi';

  -- Nettoyer
  DELETE FROM product_variants WHERE product_id = test_product_id;
  DELETE FROM products WHERE product_id = test_product_id;

  RAISE NOTICE '✅ Nettoyage réussi';
END;
$$;
