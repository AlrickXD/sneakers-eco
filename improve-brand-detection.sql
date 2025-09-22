-- =====================================================
-- AMÉLIORATION DE LA DÉTECTION DES MARQUES
-- =====================================================

-- 1. Marquer tous les produits Adidas manqués
UPDATE product_variants SET brand = 'Adidas'
WHERE brand != 'Adidas' 
AND (
  name ILIKE '%adidas%' OR 
  name ILIKE '%stan smith%' OR 
  name ILIKE '%superstar%' OR
  name ILIKE '%gazelle%' OR
  name ILIKE '%samba%' OR
  name ILIKE '%forum%' OR
  name ILIKE '%campus%' OR
  name ILIKE '%continental%' OR
  name ILIKE '%nmd%' OR
  name ILIKE '%ultraboost%' OR
  name ILIKE '%yeezy%' OR
  name ILIKE '%originals%'
);

-- 2. Améliorer Nike
UPDATE product_variants SET brand = 'Nike'
WHERE brand != 'Nike' 
AND (
  name ILIKE '%nike%' OR 
  name ILIKE '%air force%' OR 
  name ILIKE '%air max%' OR 
  name ILIKE '%jordan%' OR
  name ILIKE '%blazer%' OR
  name ILIKE '%dunk%' OR
  name ILIKE '%cortez%' OR
  name ILIKE '%pegasus%' OR
  name ILIKE '%react%' OR
  name ILIKE '%zoom%'
);

-- 3. Améliorer Converse
UPDATE product_variants SET brand = 'Converse'
WHERE brand != 'Converse' 
AND (
  name ILIKE '%converse%' OR 
  name ILIKE '%chuck taylor%' OR 
  name ILIKE '%all star%' OR
  name ILIKE '%chuck 70%' OR
  name ILIKE '%one star%'
);

-- 4. Améliorer Vans
UPDATE product_variants SET brand = 'Vans'
WHERE brand != 'Vans' 
AND (
  name ILIKE '%vans%' OR 
  name ILIKE '%old skool%' OR 
  name ILIKE '%authentic%' OR
  name ILIKE '%era%' OR
  name ILIKE '%sk8-hi%' OR
  name ILIKE '%slip-on%'
);

-- 5. Améliorer Puma
UPDATE product_variants SET brand = 'Puma'
WHERE brand != 'Puma' 
AND (
  name ILIKE '%puma%' OR
  name ILIKE '%suede%' OR
  name ILIKE '%basket%' OR
  name ILIKE '%clyde%'
);

-- 6. Améliorer New Balance
UPDATE product_variants SET brand = 'New Balance'
WHERE brand != 'New Balance' 
AND (
  name ILIKE '%new balance%' OR
  name ILIKE '%nb %' OR
  name ILIKE '% 990%' OR
  name ILIKE '% 574%' OR
  name ILIKE '% 327%'
);

-- 7. Ajouter d'autres marques courantes
UPDATE product_variants SET brand = 'Reebok'
WHERE brand NOT IN ('Nike', 'Adidas', 'Converse', 'Vans', 'Puma', 'New Balance', 'Reebok')
AND name ILIKE '%reebok%';

UPDATE product_variants SET brand = 'Asics'
WHERE brand NOT IN ('Nike', 'Adidas', 'Converse', 'Vans', 'Puma', 'New Balance', 'Reebok', 'Asics')
AND (name ILIKE '%asics%' OR name ILIKE '%gel-%');

UPDATE product_variants SET brand = 'Fila'
WHERE brand NOT IN ('Nike', 'Adidas', 'Converse', 'Vans', 'Puma', 'New Balance', 'Reebok', 'Asics', 'Fila')
AND name ILIKE '%fila%';

-- 8. Vérifier les résultats
SELECT 
  brand,
  COUNT(*) as total_variantes,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as avec_stock,
  ROUND(AVG(prix_eur), 2) as prix_moyen
FROM product_variants 
WHERE brand IN ('Nike', 'Adidas', 'Converse', 'Vans', 'Puma', 'New Balance')
GROUP BY brand 
ORDER BY avec_stock DESC;

-- 9. Voir quelques exemples d'Adidas avec stock
SELECT 
  name,
  stock,
  prix_eur,
  etat
FROM product_variants 
WHERE brand = 'Adidas'
AND stock > 0
ORDER BY stock DESC
LIMIT 10;


