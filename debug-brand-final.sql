-- =====================================================
-- DIAGNOSTIC FINAL POUR product_variants
-- =====================================================

-- 1. Vérifier que les colonnes brand et couleur existent
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_variants'
AND column_name IN ('brand', 'couleur')
ORDER BY column_name;

-- 2. Compter les données
SELECT 
  COUNT(*) as total_variantes,
  COUNT(brand) as avec_marque_non_null,
  COUNT(CASE WHEN brand IS NOT NULL AND TRIM(brand) != '' THEN 1 END) as avec_marque_valide,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as avec_stock
FROM product_variants;

-- 3. Voir les marques distinctes et leur nombre
SELECT 
  brand,
  COUNT(*) as nombre_variantes,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as avec_stock
FROM product_variants 
WHERE brand IS NOT NULL
GROUP BY brand
ORDER BY nombre_variantes DESC
LIMIT 10;

-- 4. Test simple : chercher des Nike
SELECT 
  sku,
  name,
  brand,
  stock,
  prix_eur
FROM product_variants 
WHERE brand = 'Nike'
AND stock > 0
LIMIT 5;

-- 5. Test avec d'autres marques courantes
SELECT 
  brand,
  COUNT(*) as count
FROM product_variants 
WHERE brand IN ('Nike', 'Adidas', 'Converse', 'Vans', 'Puma')
AND stock > 0
GROUP BY brand;

-- 6. Vérifier s'il y a des problèmes de casse ou d'espaces
SELECT 
  DISTINCT brand,
  LENGTH(brand) as longueur,
  ASCII(SUBSTRING(brand, 1, 1)) as premier_caractere_ascii
FROM product_variants 
WHERE brand IS NOT NULL
ORDER BY brand
LIMIT 15;

-- 7. Test de la requête exacte utilisée dans le code (avec IN)
SELECT 
  COUNT(*) as resultats_nike_adidas
FROM product_variants pv
JOIN products p ON pv.product_id = p.product_id
WHERE pv.brand IN ('Nike', 'Adidas')
AND pv.stock > 0;
