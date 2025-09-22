-- =====================================================
-- PEUPLEMENT DES MARQUES POUR product_variants
-- =====================================================

-- 1. Voir l'état actuel
SELECT 
  COUNT(*) as total_variantes,
  COUNT(brand) as avec_marque,
  COUNT(couleur) as avec_couleur
FROM product_variants;

-- 2. Peupler les marques principales basées sur le nom du produit
UPDATE product_variants SET brand = 'Nike'
WHERE (brand IS NULL OR brand = '') 
AND (
  name ILIKE '%nike%' OR 
  name ILIKE '%air force%' OR 
  name ILIKE '%air max%' OR 
  name ILIKE '%jordan%' OR
  name ILIKE '%blazer%' OR
  name ILIKE '%dunk%'
);

UPDATE product_variants SET brand = 'Adidas'
WHERE (brand IS NULL OR brand = '') 
AND (
  name ILIKE '%adidas%' OR 
  name ILIKE '%stan smith%' OR 
  name ILIKE '%superstar%' OR
  name ILIKE '%gazelle%' OR
  name ILIKE '%samba%'
);

UPDATE product_variants SET brand = 'Converse'
WHERE (brand IS NULL OR brand = '') 
AND (
  name ILIKE '%converse%' OR 
  name ILIKE '%chuck taylor%' OR 
  name ILIKE '%all star%'
);

UPDATE product_variants SET brand = 'Vans'
WHERE (brand IS NULL OR brand = '') 
AND (
  name ILIKE '%vans%' OR 
  name ILIKE '%old skool%' OR 
  name ILIKE '%authentic%' OR
  name ILIKE '%era%'
);

UPDATE product_variants SET brand = 'Puma'
WHERE (brand IS NULL OR brand = '') 
AND name ILIKE '%puma%';

UPDATE product_variants SET brand = 'New Balance'
WHERE (brand IS NULL OR brand = '') 
AND name ILIKE '%new balance%';

UPDATE product_variants SET brand = 'Reebok'
WHERE (brand IS NULL OR brand = '') 
AND name ILIKE '%reebok%';

-- 3. Peupler les couleurs principales
UPDATE product_variants SET couleur = 'NOIR'
WHERE (couleur IS NULL OR couleur = '') 
AND (name ILIKE '%noir%' OR name ILIKE '%black%' OR name ILIKE '%noire%');

UPDATE product_variants SET couleur = 'BLANC'
WHERE (couleur IS NULL OR couleur = '') 
AND (name ILIKE '%blanc%' OR name ILIKE '%white%' OR name ILIKE '%blanche%');

UPDATE product_variants SET couleur = 'ROUGE'
WHERE (couleur IS NULL OR couleur = '') 
AND (name ILIKE '%rouge%' OR name ILIKE '%red%');

UPDATE product_variants SET couleur = 'BLEU'
WHERE (couleur IS NULL OR couleur = '') 
AND (name ILIKE '%bleu%' OR name ILIKE '%blue%' OR name ILIKE '%bleue%');

UPDATE product_variants SET couleur = 'VERT'
WHERE (couleur IS NULL OR couleur = '') 
AND (name ILIKE '%vert%' OR name ILIKE '%green%' OR name ILIKE '%verte%');

-- 4. Assigner des valeurs par défaut
UPDATE product_variants SET brand = 'Autre'
WHERE brand IS NULL OR brand = '';

UPDATE product_variants SET couleur = 'MULTICOLORE'
WHERE couleur IS NULL OR couleur = '';

-- 5. Vérifier le résultat final
SELECT 
  'MARQUES' as type,
  brand as valeur,
  COUNT(*) as nombre,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as avec_stock
FROM product_variants 
GROUP BY brand 
UNION ALL
SELECT 
  'COULEURS' as type,
  couleur as valeur,
  COUNT(*) as nombre,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as avec_stock
FROM product_variants 
GROUP BY couleur
ORDER BY type, nombre DESC;
