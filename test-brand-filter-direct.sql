-- =====================================================
-- TEST DIRECT DU FILTRE MARQUE
-- =====================================================

-- 1. Compter les variantes avec des marques
SELECT COUNT(*) as total_variants FROM product_variants;
SELECT COUNT(*) as variants_with_brand FROM product_variants WHERE brand IS NOT NULL;
SELECT COUNT(*) as variants_with_stock FROM product_variants WHERE stock > 0;
SELECT COUNT(*) as variants_with_brand_and_stock FROM product_variants WHERE brand IS NOT NULL AND stock > 0;

-- 2. Voir les marques exactes dans la base
SELECT DISTINCT brand FROM product_variants WHERE brand IS NOT NULL ORDER BY brand;

-- 3. Test du filtre exact comme dans le code
SELECT 
  pv.sku,
  pv.name,
  pv.brand,
  pv.stock,
  p.name as product_name
FROM product_variants pv
JOIN products p ON pv.product_id = p.product_id
WHERE pv.brand IN ('Nike', 'Adidas') 
AND pv.stock > 0
LIMIT 10;

-- 4. Vérifier s'il y a des espaces ou caractères cachés
SELECT 
  brand,
  LENGTH(brand) as length,
  ASCII(SUBSTRING(brand, 1, 1)) as first_char_ascii,
  COUNT(*) as count
FROM product_variants 
WHERE brand IS NOT NULL
GROUP BY brand, LENGTH(brand)
ORDER BY count DESC;

-- 5. Test avec ILIKE pour voir si c'est un problème de casse
SELECT 
  pv.sku,
  pv.name,
  pv.brand,
  pv.stock
FROM product_variants pv
WHERE pv.brand ILIKE '%nike%' 
AND pv.stock > 0
LIMIT 5;


