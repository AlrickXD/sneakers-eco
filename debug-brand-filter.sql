-- =====================================================
-- DIAGNOSTIC DU FILTRE MARQUE
-- =====================================================

-- 1. Vérifier si les colonnes existent
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
AND column_name IN ('brand', 'couleur')
ORDER BY column_name;

-- 2. Vérifier les valeurs de marques dans la base
SELECT 
  brand,
  COUNT(*) as count
FROM product_variants 
WHERE brand IS NOT NULL
GROUP BY brand
ORDER BY count DESC;

-- 3. Vérifier les valeurs de couleurs dans la base
SELECT 
  couleur,
  COUNT(*) as count
FROM product_variants 
WHERE couleur IS NOT NULL
GROUP BY couleur
ORDER BY count DESC;

-- 4. Vérifier quelques exemples de données
SELECT 
  sku,
  name,
  brand,
  couleur,
  etat,
  stock
FROM product_variants 
LIMIT 10;

-- 5. Tester le filtrage par marque directement
SELECT 
  sku,
  name,
  brand
FROM product_variants 
WHERE brand IN ('Nike', 'Adidas')
LIMIT 5;

-- 6. Tester le filtrage par couleur directement
SELECT 
  sku,
  name,
  couleur
FROM product_variants 
WHERE couleur IN ('NOIR', 'BLANC')
LIMIT 5;

-- 7. Vérifier les variantes avec stock > 0
SELECT 
  brand,
  couleur,
  COUNT(*) as count_total,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as count_in_stock
FROM product_variants 
WHERE brand IS NOT NULL OR couleur IS NOT NULL
GROUP BY brand, couleur
ORDER BY count_total DESC
LIMIT 10;
