-- =====================================================
-- DEBUG ET CORRECTION : RLS avec structure actuelle
-- =====================================================

-- 1. Vérifier l'utilisateur connecté
SELECT
  'Utilisateur actuel:' as info,
  auth.uid() as user_id,
  auth.jwt() ->> 'email' as email;

-- 2. Vérifier le profil utilisateur
SELECT
  'Profil utilisateur:' as info,
  id,
  email,
  role,
  created_at
FROM profiles
WHERE id = auth.uid();

-- 3. Supprimer les politiques existantes
DROP POLICY IF EXISTS "Enable insert for sellers" ON products;
DROP POLICY IF EXISTS "Enable insert for sellers" ON product_variants;
DROP POLICY IF EXISTS "Products insert for authenticated" ON products;
DROP POLICY IF EXISTS "Product variants insert for authenticated" ON product_variants;

-- 4. Créer des politiques RLS simples et explicites
-- Pour products
CREATE POLICY "products_insert_policy" ON products
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('vendeur', 'admin')
  )
);

CREATE POLICY "products_update_policy" ON products
FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('vendeur', 'admin')
  )
);

-- Pour product_variants
CREATE POLICY "variants_insert_policy" ON product_variants
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('vendeur', 'admin')
  )
);

CREATE POLICY "variants_update_policy" ON product_variants
FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('vendeur', 'admin')
  )
);

-- 5. Afficher les politiques créées
SELECT
  'Politiques RLS créées:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('products', 'product_variants')
ORDER BY tablename, policyname;

-- 6. Tester les permissions avec des données minimales
-- (REMPLACEZ par vos valeurs de test)
INSERT INTO products (product_id, name, categorie, description, images, seller_id)
SELECT
  'DEBUG-PRODUCT-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'Debug Test Product',
  'Homme',
  'Debug test description',
  'debug-test.jpg',
  auth.uid()
WHERE auth.uid() IS NOT NULL;

-- 7. Tester l'insertion de variante
INSERT INTO product_variants (
  sku, product_id, name, etat, taille, categorie,
  prix_eur, stock, images, couleur, description, seller_id
) SELECT
  'DEBUG-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'DEBUG-PRODUCT-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'Debug Test Variant',
  'NEUF',
  40,
  'Homme',
  100.00,
  1,
  'debug-test.jpg',
  'BLANC',
  'Debug test description',
  auth.uid()
WHERE auth.uid() IS NOT NULL;

-- =====================================================
-- NOTES :
-- - Debug complet avec vérification utilisateur
-- - Politiques RLS explicites et simples
-- - Test d'insertion avec données minimales
-- - Pas besoin de colonne etat dans products
-- =====================================================
