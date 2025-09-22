-- =====================================================
-- CORRECTION SIMPLE : Politiques RLS basiques
-- =====================================================

-- 1. Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "Products insert for authenticated" ON products;
DROP POLICY IF EXISTS "Products update for authenticated" ON products;
DROP POLICY IF EXISTS "Product variants insert for authenticated" ON product_variants;
DROP POLICY IF EXISTS "Product variants update for authenticated" ON product_variants;

-- 2. Créer des politiques RLS très permissives pour le debug
-- Politiques pour products
CREATE POLICY "Allow all on products" ON products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Politiques pour product_variants
CREATE POLICY "Allow all on product_variants" ON product_variants
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Vérifier les politiques créées
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('products', 'product_variants')
ORDER BY tablename, policyname;

-- 4. Tester l'insertion
-- (Exécuter en tant qu'utilisateur authentifié vendeur)
INSERT INTO products (product_id, name, categorie, description, images, seller_id)
SELECT
  'TEST-SIMPLE-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'Simple Test Product',
  'Homme',
  'Simple test description',
  'test-simple.jpg',
  auth.uid()
WHERE auth.uid() IS NOT NULL;

-- 5. Tester l'insertion de variante
INSERT INTO product_variants (
  sku, product_id, name, etat, taille, categorie,
  prix_eur, stock, images, couleur, description, seller_id
) SELECT
  'TEST-SIMPLE-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'TEST-SIMPLE-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'Simple Test Variant',
  'NEUF',
  40,
  'Homme',
  100.00,
  1,
  'test-simple.jpg',
  'BLANC',
  'Simple test description',
  auth.uid()
WHERE auth.uid() IS NOT NULL;

-- =====================================================
-- NOTES :
-- - Politiques très permissives pour le debug
-- - Permettent toutes les opérations pour les utilisateurs authentifiés
-- - Test d'insertion simple
-- - À sécuriser après le debug
-- =====================================================
