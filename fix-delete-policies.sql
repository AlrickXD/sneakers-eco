-- =====================================================
-- CORRECTION DES POLITIQUES DE SUPPRESSION
-- =====================================================

-- 1. Vérifier les politiques existantes pour la suppression
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('products', 'product_variants')
  AND cmd = 'DELETE'
ORDER BY tablename, policyname;

-- 2. Créer ou corriger les politiques de suppression pour products
DROP POLICY IF EXISTS "Sellers and admins can delete products" ON products;
CREATE POLICY "Sellers and admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

-- 3. Créer ou corriger les politiques de suppression pour product_variants
DROP POLICY IF EXISTS "Sellers and admins can delete variants" ON product_variants;
CREATE POLICY "Sellers and admins can delete variants" ON product_variants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

-- 4. Test de suppression (optionnel - décommentez si besoin)
-- DO $$
-- DECLARE
--     test_product_id TEXT := 'TEST-DELETE-' || extract(epoch from now());
--     test_user_id UUID := auth.uid();
-- BEGIN
--     -- Créer un produit de test
--     INSERT INTO products (product_id, name, categorie, description, seller_id)
--     VALUES (test_product_id, 'Test Delete', 'Test', 'Test Description', test_user_id);
--
--     -- Créer une variante de test
--     INSERT INTO product_variants (sku, product_id, name, etat, taille, categorie, prix_eur, stock, seller_id)
--     VALUES (test_product_id || '-40-NEW', test_product_id, 'Test Delete Size 40', 'NEUF', 40, 'Test', 100, 1, test_user_id);
--
--     RAISE NOTICE '✅ Produit de test créé: %', test_product_id;
--
--     -- Test suppression produit (devrait réussir)
--     DELETE FROM products WHERE product_id = test_product_id;
--     RAISE NOTICE '✅ Test suppression réussi';
-- END $$;

-- =====================================================
-- RÉSULTATS ATTENDUS :
-- - Politiques DELETE actives pour vendeur/admin
-- - Test de suppression fonctionnel
-- =====================================================
