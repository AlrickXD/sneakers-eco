-- =====================================================
-- MISE À JOUR DE TOUS LES PRODUITS EN NEUF
-- =====================================================

-- 1. Vérifier l'état actuel des produits
SELECT
  etat,
  COUNT(*) as count,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as in_stock_count
FROM product_variants
GROUP BY etat;

-- 2. Mettre à jour TOUS les produits en NEUF
UPDATE product_variants
SET etat = 'NEUF'
WHERE etat IS NOT NULL;

-- 3. Vérifier le résultat après mise à jour
SELECT
  etat,
  COUNT(*) as count,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as in_stock_count
FROM product_variants
GROUP BY etat;

-- =====================================================
-- NOTES :
-- - Cette requête met à jour TOUS les produits sans exception
-- - Les produits en rupture de stock (stock <= 0) sont aussi mis à jour
-- - Vérifiez les résultats avant/après pour vous assurer du changement
-- =====================================================
