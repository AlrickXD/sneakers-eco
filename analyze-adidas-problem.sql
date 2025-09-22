-- =====================================================
-- ANALYSE DU PROBLÈME ADIDAS
-- =====================================================

-- 1. Combien de produits contiennent "adidas" dans le nom ?
SELECT 
  'Produits avec adidas dans le nom' as type,
  COUNT(*) as count
FROM product_variants 
WHERE name ILIKE '%adidas%';

-- 2. Combien ont été marqués comme brand = 'Adidas' ?
SELECT 
  'Produits avec brand = Adidas' as type,
  COUNT(*) as count
FROM product_variants 
WHERE brand = 'Adidas';

-- 3. Voir tous les produits qui contiennent "adidas" mais n'ont pas été marqués
SELECT 
  name,
  brand,
  stock,
  prix_eur
FROM product_variants 
WHERE name ILIKE '%adidas%'
AND brand != 'Adidas'
ORDER BY name;

-- 4. Voir tous les produits Adidas avec leur stock
SELECT 
  name,
  brand,
  stock,
  prix_eur,
  etat
FROM product_variants 
WHERE brand = 'Adidas'
ORDER BY stock DESC, name;

-- 5. Combien d'Adidas ont du stock ?
SELECT 
  'Adidas avec stock > 0' as type,
  COUNT(*) as count
FROM product_variants 
WHERE brand = 'Adidas'
AND stock > 0;

-- 6. Voir les noms de produits qui pourraient être des Adidas manqués
SELECT DISTINCT 
  name,
  brand,
  stock
FROM product_variants 
WHERE (
  name ILIKE '%stan smith%' OR
  name ILIKE '%superstar%' OR
  name ILIKE '%gazelle%' OR
  name ILIKE '%samba%' OR
  name ILIKE '%forum%' OR
  name ILIKE '%campus%' OR
  name ILIKE '%continental%' OR
  name ILIKE '%nmd%' OR
  name ILIKE '%ultraboost%' OR
  name ILIKE '%yeezy%'
)
AND brand != 'Adidas'
ORDER BY name;

-- 7. Test de la requête de filtrage exacte
SELECT 
  pv.name,
  pv.brand,
  pv.stock,
  pv.prix_eur
FROM product_variants pv
JOIN products p ON pv.product_id = p.product_id
WHERE pv.brand = 'Adidas'
AND pv.stock > 0
ORDER BY pv.name;


