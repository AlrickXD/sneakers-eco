-- =====================================================
-- MIGRATION DES DONNÉES VERS product_variants
-- =====================================================

-- 1. Vérifier l'état actuel
SELECT 'product_variants' as table_name, COUNT(*) as count FROM product_variants
UNION ALL
SELECT 'product_variants_import' as table_name, COUNT(*) as count FROM product_variants_import;

-- 2. Vider product_variants si nécessaire (ATTENTION: supprime toutes les données)
-- TRUNCATE product_variants;

-- 3. Copier toutes les données de product_variants_import vers product_variants
INSERT INTO product_variants (
  sku, product_id, name, brand, etat, taille, categorie, 
  prix_eur, stock, images, couleur, description, seller_id
)
SELECT 
  sku, product_id, name, brand, etat, taille, categorie, 
  prix_eur, stock, images, couleur, description, seller_id
FROM product_variants_import
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  etat = EXCLUDED.etat,
  taille = EXCLUDED.taille,
  categorie = EXCLUDED.categorie,
  prix_eur = EXCLUDED.prix_eur,
  stock = EXCLUDED.stock,
  images = EXCLUDED.images,
  couleur = EXCLUDED.couleur,
  description = EXCLUDED.description,
  seller_id = EXCLUDED.seller_id;

-- 4. Vérifier le résultat
SELECT 'product_variants' as table_name, COUNT(*) as count FROM product_variants
UNION ALL
SELECT 'product_variants_import' as table_name, COUNT(*) as count FROM product_variants_import;

-- 5. Vérifier les marques après migration
SELECT 
  brand,
  COUNT(*) as count,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as avec_stock
FROM product_variants
WHERE brand IS NOT NULL
GROUP BY brand
ORDER BY count DESC;


