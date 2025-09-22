-- =====================================================
-- AJOUTER LA COLONNE etat À LA TABLE products
-- =====================================================

-- 1. Ajouter la colonne etat à la table products
ALTER TABLE products
ADD COLUMN etat TEXT DEFAULT 'NEUF'
CHECK (etat IN ('NEUF', 'SECONDE_MAIN'));

-- 2. Vérifier la structure mise à jour
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 3. Optionnel : Mettre à jour les produits existants
-- (Si vous voulez définir un état par défaut pour les produits existants)
UPDATE products
SET etat = 'NEUF'
WHERE etat IS NULL;

-- 4. Optionnel : Créer un index sur la colonne etat
CREATE INDEX IF NOT EXISTS idx_products_etat ON products(etat);

-- =====================================================
-- NOTES :
-- - Ajoute la colonne etat avec contrainte CHECK
-- - Défaut à 'NEUF' pour les nouveaux produits
-- - Met à jour les produits existants si nécessaire
-- - Crée un index pour les performances
-- =====================================================
