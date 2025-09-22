-- =====================================================
-- POLITIQUES SÉCURISÉES (à appliquer après le test)
-- =====================================================

-- Supprimer les politiques permissives
DROP POLICY IF EXISTS "products_allow_all" ON products;
DROP POLICY IF EXISTS "variants_allow_all" ON product_variants;

-- Créer des politiques sécurisées
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

CREATE POLICY "products_update_own" ON products
FOR UPDATE
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

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

CREATE POLICY "variants_update_own" ON product_variants
FOR UPDATE
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- Afficher les politiques finales
SELECT
  'Politiques sécurisées actives:' as info,
  COUNT(*) as count
FROM pg_policies
WHERE tablename IN ('products', 'product_variants');

-- =====================================================
-- NOTES :
-- - Supprime les politiques permissives
-- - Crée des politiques sécurisées pour la production
-- - Seuls les vendeurs peuvent insérer/modifier
-- - Les vendeurs ne peuvent modifier que leurs propres produits
-- =====================================================
