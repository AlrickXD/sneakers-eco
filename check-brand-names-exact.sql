-- =====================================================
-- VÉRIFIER LES NOMS EXACTS DES MARQUES
-- =====================================================

-- 1. Voir toutes les marques distinctes avec stock > 0
SELECT 
  brand,
  COUNT(*) as total_products,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as with_stock
FROM product_variants 
WHERE brand IS NOT NULL 
AND brand != ''
GROUP BY brand
HAVING COUNT(CASE WHEN stock > 0 THEN 1 END) > 0
ORDER BY with_stock DESC;

-- 2. Test spécifique pour les marques du frontend
SELECT 
  'Test des marques du frontend:' as info,
  '' as brand,
  0 as count
UNION ALL
SELECT 
  'NIKE' as info,
  brand,
  COUNT(*) as count
FROM product_variants 
WHERE brand = 'NIKE' AND stock > 0
GROUP BY brand
UNION ALL
SELECT 
  'ADIDAS ORIGINALS' as info,
  brand,
  COUNT(*) as count
FROM product_variants 
WHERE brand = 'ADIDAS ORIGINALS' AND stock > 0
GROUP BY brand
UNION ALL
SELECT 
  'NEW BALANCE' as info,
  brand,
  COUNT(*) as count
FROM product_variants 
WHERE brand = 'NEW BALANCE' AND stock > 0
GROUP BY brand;
