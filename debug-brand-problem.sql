-- =====================================================
-- DIAGNOSTIC COMPLET DU PROBLÈME DES MARQUES
-- =====================================================

-- 1. Vérifier la structure de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'product_variants'
ORDER BY ordinal_position;

-- 2. Compter les données
SELECT 
  'Total variantes' as type,
  COUNT(*) as count
FROM product_variants
UNION ALL
SELECT 
  'Avec marque non null' as type,
  COUNT(*) as count
FROM product_variants 
WHERE brand IS NOT NULL
UNION ALL
SELECT 
  'Avec marque non vide' as type,
  COUNT(*) as count
FROM product_variants 
WHERE brand IS NOT NULL AND TRIM(brand) != ''
UNION ALL
SELECT 
  'Avec stock > 0' as type,
  COUNT(*) as count
FROM product_variants 
WHERE stock > 0;

-- 3. Voir les marques exactes (avec leurs caractères cachés)
SELECT 
  brand,
  LENGTH(brand) as length,
  ENCODE(brand::bytea, 'hex') as hex_value,
  COUNT(*) as count
FROM product_variants 
WHERE brand IS NOT NULL
GROUP BY brand
ORDER BY count DESC
LIMIT 10;

-- 4. Test de la requête exacte utilisée dans le code
-- Simuler la requête avec filtre marque = 'Nike'
SELECT 
  pv.sku,
  pv.name,
  pv.brand,
  pv.couleur,
  pv.stock,
  pv.prix_eur
FROM product_variants pv
JOIN products p ON pv.product_id = p.product_id
WHERE pv.brand = 'Nike'
AND pv.stock > 0
LIMIT 5;

-- 5. Test avec IN (comme dans le code)
SELECT 
  pv.sku,
  pv.name,
  pv.brand,
  pv.couleur,
  pv.stock
FROM product_variants pv
JOIN products p ON pv.product_id = p.product_id
WHERE pv.brand IN ('Nike', 'Adidas')
AND pv.stock > 0
LIMIT 5;

-- 6. Vérifier s'il y a des problèmes de casse
SELECT DISTINCT 
  brand,
  UPPER(brand) as upper_brand,
  LOWER(brand) as lower_brand
FROM product_variants 
WHERE brand IS NOT NULL
ORDER BY brand;

-- 7. Test avec ILIKE pour ignorer la casse
SELECT 
  pv.sku,
  pv.name,
  pv.brand,
  pv.stock
FROM product_variants pv
WHERE pv.brand ILIKE 'nike'
AND pv.stock > 0
LIMIT 3;

-- 8. Vérifier les index
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'product_variants'
AND indexdef LIKE '%brand%';

-- 9. Test de performance
EXPLAIN ANALYZE
SELECT 
  pv.sku,
  pv.name,
  pv.brand
FROM product_variants pv
WHERE pv.brand IN ('Nike', 'Adidas')
AND pv.stock > 0;
