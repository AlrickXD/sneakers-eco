-- =====================================================
-- STANDARDISER LES NOMS DE MARQUES
-- =====================================================

-- 1. Voir l'état actuel
SELECT 
  brand,
  COUNT(*) as count
FROM product_variants 
WHERE brand IS NOT NULL
GROUP BY brand
ORDER BY count DESC;

-- 2. Standardiser Adidas Originals -> Adidas
UPDATE product_variants 
SET brand = 'Adidas'
WHERE brand = 'Adidas Originals';

-- 3. Autres standardisations possibles
UPDATE product_variants 
SET brand = 'Nike'
WHERE brand ILIKE 'nike%' AND brand != 'Nike';

UPDATE product_variants 
SET brand = 'New Balance'
WHERE brand ILIKE '%new balance%' AND brand != 'New Balance';

-- 4. Vérifier le résultat
SELECT 
  brand,
  COUNT(*) as count,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as avec_stock
FROM product_variants 
WHERE brand IS NOT NULL
GROUP BY brand
ORDER BY count DESC;


