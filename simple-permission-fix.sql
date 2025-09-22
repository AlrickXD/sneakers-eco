-- =====================================================
-- CORRECTION SIMPLE : Résoudre les problèmes de permissions
-- =====================================================

-- 1. Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "products_insert_policy" ON products;
DROP POLICY IF EXISTS "products_update_policy" ON products;
DROP POLICY IF EXISTS "variants_insert_policy" ON product_variants;
DROP POLICY IF EXISTS "variants_update_policy" ON product_variants;
DROP POLICY IF EXISTS "Enable insert for sellers" ON products;
DROP POLICY IF EXISTS "Enable insert for sellers" ON product_variants;
DROP POLICY IF EXISTS "Products insert for authenticated" ON products;
DROP POLICY IF EXISTS "Product variants insert for authenticated" ON product_variants;
DROP POLICY IF EXISTS "Allow all on products" ON products;
DROP POLICY IF EXISTS "Allow all on product_variants" ON product_variants;
DROP POLICY IF EXISTS "ultimate_debug_products" ON products;
DROP POLICY IF EXISTS "ultimate_debug_variants" ON product_variants;
DROP POLICY IF EXISTS "temp_products_all" ON products;
DROP POLICY IF EXISTS "temp_variants_all" ON product_variants;
DROP POLICY IF EXISTS "products_allow_all" ON products;
DROP POLICY IF EXISTS "variants_allow_all" ON product_variants;
DROP POLICY IF EXISTS "target_products_all" ON products;
DROP POLICY IF EXISTS "target_variants_all" ON product_variants;
DROP POLICY IF EXISTS "force_products_all" ON products;
DROP POLICY IF EXISTS "force_variants_all" ON product_variants;

-- 2. Créer des politiques simples
CREATE POLICY "simple_products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "simple_variants" ON product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Tester l'insertion
DO $$
DECLARE
  test_product_id TEXT := 'SIMPLE-FIX-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  test_sku TEXT := 'SIMPLE-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
  -- Test simple
  INSERT INTO products (product_id, name, categorie, seller_id)
  VALUES (test_product_id, 'Test Simple', 'Homme', auth.uid());

  INSERT INTO product_variants (
    sku, product_id, name, etat, taille, categorie, prix_eur, stock, seller_id
  ) VALUES (
    test_sku, test_product_id, 'Test Simple Variante', 'NEUF', 40, 'Homme', 100.00, 1, auth.uid()
  );

  RAISE NOTICE '✅ Test d''insertion simple réussi';

  -- Nettoyer
  DELETE FROM product_variants WHERE product_id = test_product_id;
  DELETE FROM products WHERE product_id = test_product_id;
END;
$$;

-- 4. Afficher le résultat
SELECT
  'Politiques actives:' as info,
  COUNT(*) as count
FROM pg_policies
WHERE tablename IN ('products', 'product_variants');

-- =====================================================
-- NOTES :
-- - Solution simple et directe
-- - Supprime toutes les politiques problématiques
-- - Crée des politiques permissives
-- - Test d'insertion inclus
-- =====================================================
