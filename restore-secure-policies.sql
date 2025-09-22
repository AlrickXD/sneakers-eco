-- =====================================================
-- RESTAURATION : Politiques sécurisées (après debug)
-- =====================================================

-- Supprimer les politiques permissives
SELECT '=== SUPPRESSION POLITIQUES DEBUG ===' as step;
DROP POLICY IF EXISTS "ultimate_debug_products" ON products;
DROP POLICY IF EXISTS "ultimate_debug_variants" ON product_variants;

-- Recréer des politiques sécurisées
SELECT '=== CRÉATION POLITIQUES SÉCURISÉES ===' as step;

-- Pour products
CREATE POLICY "products_insert_sellers_only" ON products
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

CREATE POLICY "products_update_own_only" ON products
FOR UPDATE
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- Pour product_variants
CREATE POLICY "variants_insert_sellers_only" ON product_variants
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

CREATE POLICY "variants_update_own_only" ON product_variants
FOR UPDATE
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- Afficher les politiques finales
SELECT '=== POLITIQUES FINALES ===' as step;
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

-- =====================================================
-- NOTES :
-- - Supprime les politiques permissives de debug
-- - Crée des politiques sécurisées pour la production
-- - Seuls les vendeurs peuvent insérer/modifier
-- - Les vendeurs ne peuvent modifier que leurs propres produits
-- =====================================================
