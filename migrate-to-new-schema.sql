-- =====================================================
-- MIGRATION VERS LA NOUVELLE STRUCTURE AVEC BRAND ET COULEUR
-- =====================================================

-- 1. Ajouter les nouvelles colonnes à la table product_variants existante
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS couleur TEXT;

-- 2. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_product_variants_brand ON product_variants(brand);
CREATE INDEX IF NOT EXISTS idx_product_variants_couleur ON product_variants(couleur);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id_etat ON product_variants(product_id, etat);

-- 3. Si vous avez une table product_variants_import avec les nouvelles données
-- Vous pouvez migrer les données comme ceci :

-- Exemple de migration depuis product_variants_import vers product_variants
-- (Décommentez si vous avez des données à migrer)
/*
UPDATE product_variants 
SET 
  brand = pvi.brand,
  couleur = pvi.couleur
FROM product_variants_import pvi
WHERE product_variants.sku = pvi.sku;
*/

-- 4. Ajouter des contraintes pour les valeurs acceptées (optionnel)
-- Marques populaires
ALTER TABLE product_variants 
ADD CONSTRAINT check_brand_valid 
CHECK (brand IS NULL OR brand IN (
  'Nike', 'Adidas', 'Converse', 'Vans', 'Puma', 'New Balance', 
  'Jordan', 'Reebok', 'Asics', 'Saucony', 'Fila', 'Under Armour',
  'Timberland', 'Dr. Martens', 'Birkenstock', 'Crocs', 'Autre'
));

-- Couleurs courantes (vous pouvez ajuster selon vos besoins)
ALTER TABLE product_variants 
ADD CONSTRAINT check_couleur_valid 
CHECK (couleur IS NULL OR LENGTH(couleur) <= 100);

-- 5. Peupler automatiquement les marques et couleurs depuis les noms existants
-- Marques
UPDATE product_variants SET brand = 'Nike' 
WHERE brand IS NULL AND (name ILIKE '%nike%' OR name ILIKE '%air force%' OR name ILIKE '%air max%' OR name ILIKE '%jordan%');

UPDATE product_variants SET brand = 'Adidas' 
WHERE brand IS NULL AND (name ILIKE '%adidas%' OR name ILIKE '%stan smith%' OR name ILIKE '%superstar%');

UPDATE product_variants SET brand = 'Converse' 
WHERE brand IS NULL AND (name ILIKE '%converse%' OR name ILIKE '%chuck taylor%' OR name ILIKE '%all star%');

UPDATE product_variants SET brand = 'Vans' 
WHERE brand IS NULL AND (name ILIKE '%vans%' OR name ILIKE '%old skool%' OR name ILIKE '%authentic%');

UPDATE product_variants SET brand = 'Puma' 
WHERE brand IS NULL AND name ILIKE '%puma%';

UPDATE product_variants SET brand = 'New Balance' 
WHERE brand IS NULL AND name ILIKE '%new balance%';

-- Couleurs principales
UPDATE product_variants SET couleur = 'NOIR' 
WHERE couleur IS NULL AND (name ILIKE '%noir%' OR name ILIKE '%black%' OR name ILIKE '%noire%');

UPDATE product_variants SET couleur = 'BLANC' 
WHERE couleur IS NULL AND (name ILIKE '%blanc%' OR name ILIKE '%white%' OR name ILIKE '%blanche%');

UPDATE product_variants SET couleur = 'ROUGE' 
WHERE couleur IS NULL AND (name ILIKE '%rouge%' OR name ILIKE '%red%');

UPDATE product_variants SET couleur = 'BLEU' 
WHERE couleur IS NULL AND (name ILIKE '%bleu%' OR name ILIKE '%blue%' OR name ILIKE '%bleue%');

UPDATE product_variants SET couleur = 'VERT' 
WHERE couleur IS NULL AND (name ILIKE '%vert%' OR name ILIKE '%green%' OR name ILIKE '%verte%');

-- Couleurs composées
UPDATE product_variants SET couleur = 'NOIR / BLANC' 
WHERE couleur IS NULL AND (
  (name ILIKE '%noir%' AND name ILIKE '%blanc%') OR 
  (name ILIKE '%black%' AND name ILIKE '%white%')
);

-- 6. Vérification des données migrées
SELECT 
  brand,
  couleur,
  COUNT(*) as count
FROM product_variants 
WHERE brand IS NOT NULL OR couleur IS NOT NULL
GROUP BY brand, couleur
ORDER BY brand, couleur;
