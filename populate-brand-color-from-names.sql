-- =====================================================
-- PEUPLER LES COLONNES BRAND ET COULEUR À PARTIR DES NOMS EXISTANTS
-- À exécuter après migrate-to-new-schema.sql
-- =====================================================

-- Mettre à jour les marques basées sur les noms de produits
UPDATE product_variants SET brand = 'Nike' 
WHERE brand IS NULL AND (name ILIKE '%nike%' OR name ILIKE '%air force%' OR name ILIKE '%air max%' OR name ILIKE '%jordan%');

UPDATE product_variants SET brand = 'Adidas' 
WHERE brand IS NULL AND (name ILIKE '%adidas%' OR name ILIKE '%stan smith%' OR name ILIKE '%superstar%');

UPDATE product_variants SET brand = 'Converse' 
WHERE brand IS NULL AND (name ILIKE '%converse%' OR name ILIKE '%chuck taylor%' OR name ILIKE '%all star%');

UPDATE product_variants SET brand = 'Vans' 
WHERE brand IS NULL AND (name ILIKE '%vans%' OR name ILIKE '%old skool%' OR name ILIKE '%authentic%');

UPDATE product_variants SET brand = 'Puma' 
WHERE brand IS NULL AND name ILIKE '%puma%';

UPDATE product_variants SET brand = 'New Balance' 
WHERE brand IS NULL AND name ILIKE '%new balance%';

UPDATE product_variants SET brand = 'Reebok' 
WHERE brand IS NULL AND name ILIKE '%reebok%';

UPDATE product_variants SET brand = 'Asics' 
WHERE brand IS NULL AND name ILIKE '%asics%';

-- Mettre à jour les couleurs basées sur les noms de produits
UPDATE product_variants SET couleur = 'NOIR' 
WHERE couleur IS NULL AND (name ILIKE '%noir%' OR name ILIKE '%black%' OR name ILIKE '%noire%');

UPDATE product_variants SET couleur = 'BLANC' 
WHERE couleur IS NULL AND (name ILIKE '%blanc%' OR name ILIKE '%white%' OR name ILIKE '%blanche%');

UPDATE product_variants SET couleur = 'ROUGE' 
WHERE couleur IS NULL AND (name ILIKE '%rouge%' OR name ILIKE '%red%');

UPDATE product_variants SET couleur = 'BLEU' 
WHERE couleur IS NULL AND (name ILIKE '%bleu%' OR name ILIKE '%blue%' OR name ILIKE '%bleue%');

UPDATE product_variants SET couleur = 'VERT' 
WHERE couleur IS NULL AND (name ILIKE '%vert%' OR name ILIKE '%green%' OR name ILIKE '%verte%');

UPDATE product_variants SET couleur = 'JAUNE' 
WHERE couleur IS NULL AND (name ILIKE '%jaune%' OR name ILIKE '%yellow%');

UPDATE product_variants SET couleur = 'ROSE' 
WHERE couleur IS NULL AND (name ILIKE '%rose%' OR name ILIKE '%pink%');

UPDATE product_variants SET couleur = 'VIOLET' 
WHERE couleur IS NULL AND (name ILIKE '%violet%' OR name ILIKE '%purple%' OR name ILIKE '%violette%');

UPDATE product_variants SET couleur = 'ORANGE' 
WHERE couleur IS NULL AND name ILIKE '%orange%';

UPDATE product_variants SET couleur = 'GRIS' 
WHERE couleur IS NULL AND (name ILIKE '%gris%' OR name ILIKE '%gray%' OR name ILIKE '%grey%' OR name ILIKE '%grise%');

UPDATE product_variants SET couleur = 'MARRON' 
WHERE couleur IS NULL AND (name ILIKE '%marron%' OR name ILIKE '%brown%');

UPDATE product_variants SET couleur = 'BEIGE' 
WHERE couleur IS NULL AND name ILIKE '%beige%';

-- Couleurs composées
UPDATE product_variants SET couleur = 'NOIR / BLANC' 
WHERE couleur IS NULL AND (
  (name ILIKE '%noir%' AND name ILIKE '%blanc%') OR 
  (name ILIKE '%black%' AND name ILIKE '%white%')
);

UPDATE product_variants SET couleur = 'NOIR / ROUGE' 
WHERE couleur IS NULL AND (
  (name ILIKE '%noir%' AND name ILIKE '%rouge%') OR 
  (name ILIKE '%black%' AND name ILIKE '%red%')
);

-- Vérification des résultats
SELECT 
  brand,
  couleur,
  COUNT(*) as count
FROM product_variants 
WHERE brand IS NOT NULL OR couleur IS NOT NULL
GROUP BY brand, couleur
ORDER BY brand, couleur;

-- Statistiques
SELECT 
  'Avec marque' as type,
  COUNT(*) as count
FROM product_variants 
WHERE brand IS NOT NULL
UNION ALL
SELECT 
  'Avec couleur' as type,
  COUNT(*) as count
FROM product_variants 
WHERE couleur IS NOT NULL
UNION ALL
SELECT 
  'Total variantes' as type,
  COUNT(*) as count
FROM product_variants;


