-- =====================================================
-- CORRECTION : Permettre la lecture des produits pour tous
-- =====================================================

-- 1. Supprimer toutes les politiques existantes sur products
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
DROP POLICY IF EXISTS "fix_products" ON products;
DROP POLICY IF EXISTS "fix_variants" ON product_variants;

-- 2. Créer des politiques pour la lecture (tout le monde peut lire)
CREATE POLICY "products_read_all" ON products FOR SELECT USING (true);
CREATE POLICY "variants_read_all" ON product_variants FOR SELECT USING (true);

-- 3. Créer des politiques pour l'écriture (seulement les vendeurs)
CREATE POLICY "products_insert_sellers" ON products
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'vendeur'
  )
);

CREATE POLICY "products_update_sellers" ON products
FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'vendeur'
  )
);

CREATE POLICY "variants_insert_sellers" ON product_variants
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'vendeur'
  )
);

CREATE POLICY "variants_update_sellers" ON product_variants
FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'vendeur'
  )
);

-- 4. Afficher les politiques créées
SELECT
  '=== POLITIQUES CRÉÉES ===' as section,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('products', 'product_variants')
ORDER BY tablename, policyname;

-- =====================================================
-- NOTES :
-- - Permet la lecture des produits pour tout le monde (authentifié ou non)
-- - Permet l'écriture seulement pour les vendeurs authentifiés
-- - Résout le problème de visibilité des produits quand déconnecté
-- =====================================================
