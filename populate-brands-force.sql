-- =====================================================
-- FORCER LE PEUPLEMENT DES MARQUES
-- =====================================================

-- 1. D'abord, voir l'état actuel
SELECT 
  'Avant peuplement' as etape,
  COUNT(*) as total_variants,
  COUNT(brand) as variants_avec_marque
FROM product_variants;

-- 2. Nettoyer les marques existantes (au cas où il y aurait des espaces)
UPDATE product_variants 
SET brand = TRIM(brand) 
WHERE brand IS NOT NULL;

-- 3. Forcer le peuplement des marques les plus courantes
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

-- 4. Pour les variantes sans marque identifiée, assigner une marque générique
UPDATE product_variants SET brand = 'Autre'
WHERE brand IS NULL OR brand = '';

-- 5. Vérifier le résultat
SELECT 
  'Après peuplement' as etape,
  COUNT(*) as total_variants,
  COUNT(brand) as variants_avec_marque
FROM product_variants;

-- 6. Voir la répartition des marques
SELECT 
  brand,
  COUNT(*) as count,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as avec_stock
FROM product_variants 
GROUP BY brand 
ORDER BY count DESC;

-- 7. Test de la requête de filtrage
SELECT 
  'Test filtrage Nike' as test,
  COUNT(*) as resultats
FROM product_variants pv
JOIN products p ON pv.product_id = p.product_id
WHERE pv.brand = 'Nike'
AND pv.stock > 0;

-- 8. Créer un index si il n'existe pas
CREATE INDEX IF NOT EXISTS idx_product_variants_brand_stock 
ON product_variants(brand, stock) 
WHERE stock > 0;


