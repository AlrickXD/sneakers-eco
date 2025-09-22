-- =====================================================
-- POLITIQUES RLS SÉCURISÉES (à appliquer après debug)
-- =====================================================

-- Supprimer les politiques permissives
DROP POLICY IF EXISTS "Allow all on products" ON products;
DROP POLICY IF EXISTS "Allow all on product_variants" ON product_variants;

-- Recréer des politiques sécurisées
-- Pour products
CREATE POLICY "Products insert for sellers only" ON products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'vendeur'
  )
);

CREATE POLICY "Products update own products" ON products
FOR UPDATE
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- Pour product_variants
CREATE POLICY "Product variants insert for sellers only" ON product_variants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'vendeur'
  )
);

CREATE POLICY "Product variants update own variants" ON product_variants
FOR UPDATE
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- =====================================================
-- NOTES :
-- - Politiques sécurisées pour la production
-- - Seuls les vendeurs peuvent insérer/modifier
-- - Les vendeurs ne peuvent modifier que leurs propres produits
-- =====================================================
