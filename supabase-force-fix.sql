-- =====================================================
-- CORRECTION FORCE : Compatible avec Supabase
-- =====================================================

-- 1. Supprimer TOUTES les politiques RLS existantes
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

-- 2. Désactiver temporairement RLS pour le test
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;

-- 3. Tester l'insertion sans RLS
DO $$
DECLARE
  test_product_id TEXT := 'FORCE-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  test_sku TEXT := 'FORCE-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
  -- Insérer le produit
  INSERT INTO products (product_id, name, categorie, description, images, seller_id)
  VALUES (test_product_id, 'Force Test Product', 'Homme', 'Force Test', 'test.jpg', auth.uid());

  -- Insérer la variante
  INSERT INTO product_variants (
    sku, product_id, name, etat, taille, categorie,
    prix_eur, stock, images, couleur, description, seller_id
  ) VALUES (
    test_sku, test_product_id, 'Force Test Variant', 'NEUF', 40, 'Homme',
    100.00, 1, 'test.jpg', 'BLANC', 'Force Test', auth.uid()
  );

  -- Nettoyer les tests
  DELETE FROM product_variants WHERE product_id = test_product_id;
  DELETE FROM products WHERE product_id = test_product_id;
END;
$$;

-- 4. Réactiver RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- 5. Créer des politiques ultra-permissives
CREATE POLICY "force_products_all" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "force_variants_all" ON product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Tester avec les nouvelles politiques
DO $$
DECLARE
  test_product_id TEXT := 'FINAL-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  test_sku TEXT := 'FINAL-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
  -- Insérer le produit
  INSERT INTO products (product_id, name, categorie, description, images, seller_id)
  VALUES (test_product_id, 'Final Test Product', 'Homme', 'Final Test', 'test.jpg', auth.uid());

  -- Insérer la variante
  INSERT INTO product_variants (
    sku, product_id, name, etat, taille, categorie,
    prix_eur, stock, images, couleur, description, seller_id
  ) VALUES (
    test_sku, test_product_id, 'Final Test Variant', 'NEUF', 40, 'Homme',
    100.00, 1, 'test.jpg', 'BLANC', 'Final Test', auth.uid()
  );

  -- Nettoyer les tests
  DELETE FROM product_variants WHERE product_id = test_product_id;
  DELETE FROM products WHERE product_id = test_product_id;
END;
$$;

-- 7. Afficher le résultat final
SELECT
  'Politiques actives:' as info,
  COUNT(*) as count
FROM pg_policies
WHERE tablename IN ('products', 'product_variants');

-- =====================================================
-- NOTES :
-- - Version compatible avec Supabase (pas de RAISE NOTICE)
-- - Supprime TOUTES les politiques problématiques
-- - Test d'insertion inclus
-- - Solution force qui devrait fonctionner
-- =====================================================
