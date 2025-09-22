-- =====================================================
-- VÉRIFIER LES NOMS EXACTS DES MARQUES DANS LA DB
-- =====================================================

-- 1. Voir toutes les marques distinctes avec leur nombre
SELECT 
  brand,
  COUNT(*) as nombre_variantes,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as avec_stock
FROM product_variants 
WHERE brand IS NOT NULL
GROUP BY brand
ORDER BY nombre_variantes DESC;

-- 2. Chercher spécifiquement les variantes d'Adidas
SELECT 
  brand,
  COUNT(*) as count
FROM product_variants 
WHERE brand ILIKE '%adidas%'
GROUP BY brand;

-- 3. Voir quelques exemples de produits Adidas Originals
SELECT 
  name,
  brand,
  stock,
  prix_eur
FROM product_variants 
WHERE brand ILIKE '%adidas%'
AND stock > 0
LIMIT 10;

-- 4. Vérifier les autres marques courantes
SELECT 
  brand,
  COUNT(*) as count
FROM product_variants 
WHERE brand IN ('Nike', 'Adidas', 'Adidas Originals', 'Converse', 'Vans', 'Puma')
GROUP BY brand
ORDER BY count DESC;
