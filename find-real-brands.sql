-- =====================================================
-- IDENTIFICATION DES VRAIES MARQUES DANS LA DB
-- =====================================================

-- 1. Marques uniques dans product_variants (avec comptage)
SELECT
  brand,
  COUNT(*) as count,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as in_stock_count,
  COUNT(CASE WHEN stock <= 0 THEN 1 END) as out_of_stock_count
FROM product_variants
WHERE brand IS NOT NULL AND brand != ''
GROUP BY brand
ORDER BY count DESC;

-- 2. Marques uniques dans products (via les variantes)
SELECT DISTINCT
  pv.brand,
  COUNT(DISTINCT pv.product_id) as product_count,
  COUNT(pv.sku) as variant_count
FROM product_variants pv
WHERE pv.brand IS NOT NULL AND pv.brand != ''
GROUP BY pv.brand
ORDER BY product_count DESC;

-- 3. Marques populaires (avec stock)
SELECT
  brand,
  COUNT(*) as total_variants,
  SUM(stock) as total_stock,
  COUNT(DISTINCT product_id) as unique_products
FROM product_variants
WHERE brand IS NOT NULL
  AND brand != ''
  AND stock > 0
GROUP BY brand
ORDER BY total_stock DESC
LIMIT 20;

-- 4. Test de filtrage par marque
SELECT
  'Nike' as test_brand,
  COUNT(*) as nike_count
FROM product_variants
WHERE brand = 'Nike' AND stock > 0
UNION ALL
SELECT
  'Adidas Originals' as test_brand,
  COUNT(*) as adidas_count
FROM product_variants
WHERE brand = 'Adidas Originals' AND stock > 0;

-- =====================================================
-- RÉSULTATS ATTENDUS :
-- - Liste des marques réelles avec leur popularité
-- - Comptage des variantes en stock
-- - Test de filtrage par marque
-- =====================================================
