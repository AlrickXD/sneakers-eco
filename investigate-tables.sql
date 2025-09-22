-- =====================================================
-- INVESTIGATION COMPLÈTE DES TABLES
-- =====================================================

-- 1. Lister toutes les tables qui contiennent "variant" dans le nom
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%variant%'
ORDER BY table_name;

-- 2. Lister toutes les tables qui contiennent "product" dans le nom
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name ILIKE '%product%'
ORDER BY table_name;

-- 3. Compter les lignes dans product_variants
SELECT 'product_variants' as table_name, COUNT(*) as total_rows
FROM product_variants;

-- 4. Compter les lignes dans product_variants_import (si elle existe)
SELECT 'product_variants_import' as table_name, COUNT(*) as total_rows
FROM product_variants_import;

-- 5. Voir la structure de product_variants
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'product_variants'
ORDER BY ordinal_position;

-- 6. Voir la structure de product_variants_import
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'product_variants_import'
ORDER BY ordinal_position;

-- 7. Voir quelques exemples de chaque table
SELECT 'product_variants' as source, sku, name, brand, stock, prix_eur
FROM product_variants
LIMIT 5;

SELECT 'product_variants_import' as source, sku, name, brand, stock, prix_eur
FROM product_variants_import
LIMIT 5;

-- 8. Comparer les marques dans les deux tables
SELECT 'product_variants' as source, brand, COUNT(*) as count
FROM product_variants
WHERE brand IS NOT NULL
GROUP BY brand
UNION ALL
SELECT 'product_variants_import' as source, brand, COUNT(*) as count
FROM product_variants_import
WHERE brand IS NOT NULL
GROUP BY brand
ORDER BY source, count DESC;
