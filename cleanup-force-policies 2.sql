-- =====================================================
-- NETTOYAGE : Supprimer les politiques force
-- =====================================================

-- Supprimer les politiques de force
DROP POLICY IF EXISTS "force_products_all" ON products;
DROP POLICY IF EXISTS "force_variants_all" ON product_variants;

-- Afficher les politiques restantes
SELECT
  'Politiques après nettoyage:' as info,
  COUNT(*) as count
FROM pg_policies
WHERE tablename IN ('products', 'product_variants');

-- =====================================================
-- NOTES :
-- - Supprime les politiques permissives de force
-- - Prépare pour les politiques sécurisées
-- =====================================================
