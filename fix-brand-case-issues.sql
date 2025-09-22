-- =====================================================
-- CORRIGER LES PROBLÈMES DE CASSE DES MARQUES
-- =====================================================

-- 1. Voir l'état actuel avec les doublons
SELECT 
  brand,
  COUNT(*) as count,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as avec_stock
FROM product_variants
WHERE brand IS NOT NULL
GROUP BY brand
ORDER BY count DESC;

-- 2. Standardiser les marques (MAJUSCULES vers format propre)
UPDATE product_variants SET brand = 'Nike' WHERE brand IN ('NIKE', 'nike');
UPDATE product_variants SET brand = 'Adidas Originals' WHERE brand IN ('ADIDAS ORIGINALS', 'Adidas', 'adidas');
UPDATE product_variants SET brand = 'New Balance' WHERE brand IN ('NEW BALANCE', 'new balance');
UPDATE product_variants SET brand = 'Jordan' WHERE brand IN ('JORDAN', 'jordan');
UPDATE product_variants SET brand = 'UGG' WHERE brand IN ('UGG', 'ugg');
UPDATE product_variants SET brand = 'Asics' WHERE brand IN ('ASICS', 'asics');
UPDATE product_variants SET brand = 'Lacoste' WHERE brand IN ('LACOSTE', 'lacoste');
UPDATE product_variants SET brand = 'Puma' WHERE brand IN ('PUMA', 'puma');
UPDATE product_variants SET brand = 'Converse' WHERE brand IN ('CONVERSE', 'converse');
UPDATE product_variants SET brand = 'Vans' WHERE brand IN ('VANS', 'vans');
UPDATE product_variants SET brand = 'Timberland' WHERE brand IN ('TIMBERLAND', 'timberland');
UPDATE product_variants SET brand = 'On Running' WHERE brand IN ('ON RUNNING', 'on running');
UPDATE product_variants SET brand = 'Polo Ralph Lauren' WHERE brand IN ('POLO RALPH LAUREN', 'polo ralph lauren');
UPDATE product_variants SET brand = 'Birkenstock' WHERE brand IN ('BIRKENSTOCK', 'birkenstock');

-- 3. Vérifier le résultat après standardisation
SELECT 
  brand,
  COUNT(*) as count,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as avec_stock
FROM product_variants
WHERE brand IS NOT NULL
GROUP BY brand
ORDER BY count DESC;

-- 4. Test spécifique pour Adidas Originals
SELECT 
  COUNT(*) as total_adidas_originals,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as avec_stock
FROM product_variants
WHERE brand = 'Adidas Originals';
