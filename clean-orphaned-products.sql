-- =====================================================
-- NETTOYAGE DES PRODUITS ORFELINS (RUPTURE DE STOCK)
-- =====================================================

-- 1. Identifier les produits sans variantes en stock
SELECT
  p.product_id,
  p.name as product_name,
  COUNT(pv.sku) as variant_count,
  SUM(pv.stock) as total_stock,
  STRING_AGG(DISTINCT pv.sku, ', ') as skus
FROM products p
LEFT JOIN product_variants pv ON p.product_id = pv.product_id
GROUP BY p.product_id, p.name
HAVING SUM(pv.stock) <= 0 OR COUNT(pv.sku) = 0
ORDER BY p.product_id;

-- 2. Supprimer les variantes en rupture de stock
DELETE FROM product_variants
WHERE stock <= 0;

-- 3. Supprimer les produits sans variantes
DELETE FROM products
WHERE product_id NOT IN (
  SELECT DISTINCT product_id
  FROM product_variants
  WHERE stock > 0
);

-- 4. Vérifier le résultat
SELECT
  'products' as table_name,
  COUNT(*) as remaining_count
FROM products
UNION ALL
SELECT
  'product_variants' as table_name,
  COUNT(*) as remaining_count
FROM product_variants;

-- =====================================================
-- ALTERNATIVE : NETTOYAGE SPÉCIFIQUE
-- Remplacez 'VOTRE-PRODUCT-ID' par l'ID du produit à supprimer
-- =====================================================

-- Pour supprimer un produit spécifique :
/*
DELETE FROM product_variants WHERE product_id = 'VOTRE-PRODUCT-ID';
DELETE FROM products WHERE product_id = 'VOTRE-PRODUCT-ID';
*/

-- =====================================================
-- INSTRUCTIONS :
-- 1. Copier ce contenu
-- 2. Aller dans Supabase Dashboard > SQL Editor
-- 3. Coller et exécuter cette requête
-- 4. Vérifier que les produits en rupture de stock ont disparu
-- =====================================================
