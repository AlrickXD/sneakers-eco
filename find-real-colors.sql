-- =====================================================
-- IDENTIFICATION DES VRAIES COULEURS DANS LA DB
-- =====================================================

-- 1. Couleurs uniques dans product_variants (avec comptage)
SELECT
  couleur,
  COUNT(*) as count,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as in_stock_count,
  COUNT(CASE WHEN stock <= 0 THEN 1 END) as out_of_stock_count
FROM product_variants
WHERE couleur IS NOT NULL AND couleur != ''
GROUP BY couleur
ORDER BY count DESC;

-- 2. Couleurs populaires (avec stock)
SELECT
  couleur,
  COUNT(*) as total_variants,
  SUM(stock) as total_stock,
  COUNT(DISTINCT product_id) as unique_products
FROM product_variants
WHERE couleur IS NOT NULL
  AND couleur != ''
  AND stock > 0
GROUP BY couleur
ORDER BY total_stock DESC
LIMIT 20;

-- 3. Test de filtrage par couleur
SELECT
  'BLANC' as test_color,
  COUNT(*) as blanc_count
FROM product_variants
WHERE couleur = 'BLANC' AND stock > 0
UNION ALL
SELECT
  'NOIR' as test_color,
  COUNT(*) as noir_count
FROM product_variants
WHERE couleur = 'NOIR' AND stock > 0;

-- =====================================================
-- RÉSULTATS ATTENDUS :
-- - Liste des couleurs réelles avec leur popularité
-- - Comptage des variantes en stock
-- - Test de filtrage par couleur
-- =====================================================
