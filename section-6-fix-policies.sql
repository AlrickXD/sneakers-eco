-- === SECTION 6: Corriger les politiques RLS ===
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

CREATE POLICY "fix_products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "fix_variants" ON product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
