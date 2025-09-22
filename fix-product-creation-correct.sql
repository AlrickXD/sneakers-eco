-- =====================================================
-- CORRECTION : Création de produits (sans colonne etat)
-- =====================================================

-- 1. Supprimer les politiques RLS existantes problématiques
DROP POLICY IF EXISTS "Products insert for sellers" ON products;
DROP POLICY IF EXISTS "Product variants insert for sellers" ON product_variants;
DROP POLICY IF EXISTS "Products update for sellers" ON products;
DROP POLICY IF EXISTS "Product variants update for sellers" ON product_variants;

-- 2. Recréer les politiques RLS simplifiées
-- Pour la table products
CREATE POLICY "Products insert for authenticated" ON products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('vendeur', 'admin')
  )
);

CREATE POLICY "Products update for authenticated" ON products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('vendeur', 'admin')
  )
);

-- Pour la table product_variants
CREATE POLICY "Product variants insert for authenticated" ON product_variants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('vendeur', 'admin')
  )
);

CREATE POLICY "Product variants update for authenticated" ON product_variants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('vendeur', 'admin')
  )
);

-- 3. Donner les permissions nécessaires sur les séquences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 4. Vérifier les politiques créées
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

-- 5. Tester l'insertion d'un produit de test
-- (REMPLACEZ les valeurs par vos valeurs de test)
INSERT INTO products (product_id, name, categorie, description, images, seller_id)
SELECT
  'TEST-PRODUCT-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'Test Product',
  'Homme',
  'Test description',
  'test.jpg',
  auth.uid()
WHERE auth.uid() IS NOT NULL;

-- 6. Tester l'insertion d'une variante de test
-- (REMPLACEZ les valeurs par vos valeurs de test)
INSERT INTO product_variants (
  sku, product_id, name, brand, etat, taille, categorie,
  prix_eur, stock, images, couleur, description, seller_id
) SELECT
  'TEST-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'TEST-PRODUCT-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  'Test Variant',
  'Nike',
  'NEUF',
  40,
  'Homme',
  100.00,
  1,
  'test.jpg',
  'BLANC',
  'Test description',
  auth.uid()
WHERE auth.uid() IS NOT NULL;

-- =====================================================
-- NOTES :
-- - Politiques adaptées à la nouvelle structure (sans etat dans products)
-- - Test d'insertion de données minimales
-- - Permissions sur les séquences accordées
-- =====================================================
