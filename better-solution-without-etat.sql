-- =====================================================
-- SOLUTION OPTIMALE : Sans colonne etat dans products
-- =====================================================

-- 1. Supprimer les politiques RLS existantes
DROP POLICY IF EXISTS "Products insert for authenticated" ON products;
DROP POLICY IF EXISTS "Products update for authenticated" ON products;
DROP POLICY IF EXISTS "Product variants insert for authenticated" ON product_variants;
DROP POLICY IF EXISTS "Product variants update for authenticated" ON product_variants;

-- 2. Recréer les politiques avec vérification du rôle vendeur
CREATE POLICY "Products insert for sellers" ON products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'vendeur'
  )
);

CREATE POLICY "Products update for sellers" ON products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'vendeur'
  )
);

CREATE POLICY "Product variants insert for sellers" ON product_variants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'vendeur'
  )
);

CREATE POLICY "Product variants update for sellers" ON product_variants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'vendeur'
  )
);

-- 3. Donner les permissions sur les séquences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

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

-- =====================================================
-- NOTES :
-- - Politiques sécurisées sans colonne etat redondante
- - Seuls les vendeurs peuvent insérer/modifier
- - Structure DB optimisée (état par variante, pas par produit)
- - Pas de redondance de données
-- =====================================================
