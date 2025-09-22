-- =====================================================
-- POLITIQUES SÉCURISÉES (compatible Supabase)
-- =====================================================

-- Supprimer les politiques permissives de force
DROP POLICY IF EXISTS "force_products_all" ON products;
DROP POLICY IF EXISTS "force_variants_all" ON product_variants;

-- Créer des politiques sécurisées
CREATE POLICY "secure_products_insert" ON products
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

CREATE POLICY "secure_products_update" ON products
FOR UPDATE
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "secure_variants_insert" ON product_variants
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

CREATE POLICY "secure_variants_update" ON product_variants
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
-- - Version compatible avec Supabase
-- - Politiques sécurisées pour la production
-- - Seuls les vendeurs peuvent insérer/modifier
-- - Les vendeurs ne peuvent modifier que leurs propres produits
-- =====================================================
