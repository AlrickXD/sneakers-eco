-- =====================================================
-- CORRIGER LES VALEURS DE MARQUES POUR CORRESPONDRE AU CODE
-- =====================================================

-- 1. Standardiser les valeurs de marques existantes
UPDATE product_variants SET brand = 'Nike' 
WHERE brand ILIKE '%nike%' AND brand != 'Nike';

UPDATE product_variants SET brand = 'Adidas' 
WHERE brand ILIKE '%adidas%' AND brand != 'Adidas';

UPDATE product_variants SET brand = 'Converse' 
WHERE brand ILIKE '%converse%' AND brand != 'Converse';

UPDATE product_variants SET brand = 'Vans' 
WHERE brand ILIKE '%vans%' AND brand != 'Vans';

UPDATE product_variants SET brand = 'Puma' 
WHERE brand ILIKE '%puma%' AND brand != 'Puma';

UPDATE product_variants SET brand = 'New Balance' 
WHERE brand ILIKE '%new balance%' AND brand != 'New Balance';

UPDATE product_variants SET brand = 'Jordan' 
WHERE brand ILIKE '%jordan%' AND brand != 'Jordan';

UPDATE product_variants SET brand = 'Reebok' 
WHERE brand ILIKE '%reebok%' AND brand != 'Reebok';

UPDATE product_variants SET brand = 'Asics' 
WHERE brand ILIKE '%asics%' AND brand != 'Asics';

UPDATE product_variants SET brand = 'Saucony' 
WHERE brand ILIKE '%saucony%' AND brand != 'Saucony';

-- 2. Ajouter des marques manquantes basées sur les noms
UPDATE product_variants SET brand = 'Nike' 
WHERE brand IS NULL AND (
  name ILIKE '%nike%' OR 
  name ILIKE '%air force%' OR 
  name ILIKE '%air max%' OR 
  name ILIKE '%air jordan%'
);

UPDATE product_variants SET brand = 'Jordan' 
WHERE brand IS NULL AND (
  name ILIKE '%jordan%' OR 
  name ILIKE '%air jordan%'
);

UPDATE product_variants SET brand = 'Adidas' 
WHERE brand IS NULL AND (
  name ILIKE '%adidas%' OR 
  name ILIKE '%stan smith%' OR 
  name ILIKE '%superstar%' OR
  name ILIKE '%gazelle%' OR
  name ILIKE '%ultraboost%'
);

UPDATE product_variants SET brand = 'Converse' 
WHERE brand IS NULL AND (
  name ILIKE '%converse%' OR 
  name ILIKE '%chuck taylor%' OR 
  name ILIKE '%all star%'
);

UPDATE product_variants SET brand = 'Vans' 
WHERE brand IS NULL AND (
  name ILIKE '%vans%' OR 
  name ILIKE '%old skool%' OR 
  name ILIKE '%authentic%' OR
  name ILIKE '%era%'
);

UPDATE product_variants SET brand = 'Puma' 
WHERE brand IS NULL AND (
  name ILIKE '%puma%' OR
  name ILIKE '%suede%'
);

UPDATE product_variants SET brand = 'New Balance' 
WHERE brand IS NULL AND name ILIKE '%new balance%';

UPDATE product_variants SET brand = 'Reebok' 
WHERE brand IS NULL AND (
  name ILIKE '%reebok%' OR
  name ILIKE '%classic leather%'
);

-- 3. Vérifier les résultats
SELECT 
  brand,
  COUNT(*) as count,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as in_stock
FROM product_variants 
WHERE brand IS NOT NULL
GROUP BY brand
ORDER BY count DESC;

-- 4. Afficher quelques exemples pour vérification
SELECT 
  name,
  brand,
  couleur,
  stock
FROM product_variants 
WHERE brand IN ('Nike', 'Adidas', 'Converse', 'Vans')
AND stock > 0
LIMIT 10;


