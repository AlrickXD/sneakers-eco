-- =====================================================
-- CORRECTION : Problèmes de création de produits
-- =====================================================

-- 1. Supprimer les politiques RLS existantes problématiques
DROP POLICY IF EXISTS "Enable insert for sellers" ON products;
DROP POLICY IF EXISTS "Enable insert for sellers" ON product_variants;
DROP POLICY IF EXISTS "Enable update for sellers" ON products;
DROP POLICY IF EXISTS "Enable update for sellers" ON product_variants;

-- 2. Recréer les politiques RLS simplifiées
-- Pour la table products
CREATE POLICY "Products insert for sellers" ON products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('vendeur', 'admin')
  )
);

CREATE POLICY "Products update for sellers" ON products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('vendeur', 'admin')
  )
);

-- Pour la table product_variants
CREATE POLICY "Product variants insert for sellers" ON product_variants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('vendeur', 'admin')
  )
);

CREATE POLICY "Product variants update for sellers" ON product_variants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('vendeur', 'admin')
  )
);

-- 3. Vérifier que les politiques sont en place
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

-- 4. Donner les permissions nécessaires sur les séquences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 5. Tester les permissions avec un utilisateur test
-- (Exécuter ces requêtes après s'être connecté en tant que vendeur)
-- INSERT INTO products (product_id, name, categorie, description, images, seller_id)
-- VALUES ('TEST-INSERT-123', 'Test Insert', 'Homme', 'Test', 'test.jpg', auth.uid());

-- =====================================================
-- NOTES :
-- - Supprime les anciennes politiques problématiques
-- - Crée de nouvelles politiques simplifiées
-- - Donne les permissions sur les séquences
-- - Teste l'insertion
-- =====================================================
