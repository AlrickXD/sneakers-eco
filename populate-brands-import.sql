-- =====================================================
-- PEUPLEMENT DES MARQUES POUR product_variants_import
-- =====================================================

-- 1. Voir l'état actuel
SELECT 
  COUNT(*) as total_variantes,
  COUNT(brand) as avec_marque
FROM product_variants_import;

-- 2. Peupler les marques principales basées sur le nom du produit
UPDATE product_variants_import SET brand = 'Nike'
WHERE brand IS NULL 
AND (
  name ILIKE '%nike%' OR 
  name ILIKE '%air force%' OR 
  name ILIKE '%air max%' OR 
  name ILIKE '%jordan%'
);

UPDATE product_variants_import SET brand = 'Adidas'
WHERE brand IS NULL 
AND (
  name ILIKE '%adidas%' OR 
  name ILIKE '%stan smith%' OR 
  name ILIKE '%superstar%'
);

UPDATE product_variants_import SET brand = 'Converse'
WHERE brand IS NULL 
AND (
  name ILIKE '%converse%' OR 
  name ILIKE '%chuck taylor%'
);

UPDATE product_variants_import SET brand = 'Vans'
WHERE brand IS NULL 
AND (
  name ILIKE '%vans%' OR 
  name ILIKE '%old skool%'
);

UPDATE product_variants_import SET brand = 'Puma'
WHERE brand IS NULL 
AND name ILIKE '%puma%';

-- 3. Assigner "Autre" aux variantes sans marque identifiée
UPDATE product_variants_import SET brand = 'Autre'
WHERE brand IS NULL;

-- 4. Vérifier le résultat
SELECT 
  brand,
  COUNT(*) as nombre,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as avec_stock
FROM product_variants_import 
GROUP BY brand 
ORDER BY nombre DESC;


