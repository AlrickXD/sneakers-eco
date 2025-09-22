-- =====================================================
-- IDENTIFICATION DES PRODUITS À SUPPRIMER
-- =====================================================

-- 1. Lister tous les produits avec leurs variantes
SELECT
  p.product_id,
  p.name as product_name,
  p.categorie,
  COUNT(pv.sku) as variant_count,
  SUM(pv.stock) as total_stock,
  CASE
    WHEN COUNT(pv.sku) = 0 THEN 'Aucune variante'
    WHEN SUM(pv.stock) <= 0 THEN 'Rupture de stock'
    ELSE 'En stock'
  END as status
FROM products p
LEFT JOIN product_variants pv ON p.product_id = pv.product_id
GROUP BY p.product_id, p.name, p.categorie
ORDER BY p.product_id;

-- 2. Lister spécifiquement les produits en rupture de stock
SELECT
  p.product_id,
  p.name as product_name,
  COUNT(pv.sku) as variant_count,
  STRING_AGG(DISTINCT pv.sku, ', ') as skus,
  STRING_AGG(DISTINCT pv.name, ', ') as variant_names
FROM products p
LEFT JOIN product_variants pv ON p.product_id = pv.product_id
WHERE pv.stock <= 0 OR pv.stock IS NULL
GROUP BY p.product_id, p.name
ORDER BY p.product_id;

-- 3. Compter les produits par statut
SELECT
  CASE
    WHEN COUNT(pv.sku) = 0 THEN 'Aucune variante'
    WHEN SUM(pv.stock) <= 0 THEN 'Rupture de stock'
    WHEN SUM(pv.stock) > 0 THEN 'En stock'
  END as status,
  COUNT(DISTINCT p.product_id) as count
FROM products p
LEFT JOIN product_variants pv ON p.product_id = pv.product_id
GROUP BY
  CASE
    WHEN COUNT(pv.sku) = 0 THEN 'Aucune variante'
    WHEN SUM(pv.stock) <= 0 THEN 'Rupture de stock'
    WHEN SUM(pv.stock) > 0 THEN 'En stock'
  END;

-- =====================================================
-- POUR SUPPRIMER UN PRODUIT SPÉCIFIQUE :
-- Remplacez 'VOTRE-PRODUCT-ID' par l'ID du produit à supprimer
-- =====================================================

-- Exemple pour supprimer un produit spécifique :
/*
BEGIN;
DELETE FROM product_variants WHERE product_id = 'NIKE-DUNK-LOW-36-SECONDE-MAIN';
DELETE FROM products WHERE product_id = 'NIKE-DUNK-LOW-36-SECONDE-MAIN';
COMMIT;
*/

-- =====================================================
-- INSTRUCTIONS :
-- 1. Exécutez cette requête pour identifier les produits problématiques
-- 2. Notez les product_id des produits à supprimer
-- 3. Utilisez les requêtes DELETE ci-dessus pour les supprimer
-- =====================================================
