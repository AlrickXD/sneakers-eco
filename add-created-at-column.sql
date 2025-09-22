-- =====================================================
-- AJOUTER LA COLONNE created_at À product_variants
-- =====================================================

-- 1. Ajouter la colonne created_at si elle n'existe pas
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Créer un index sur created_at pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_product_variants_created_at
ON product_variants(created_at DESC);

-- 3. Vérifier la structure mise à jour
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'product_variants'
ORDER BY ordinal_position;

-- =====================================================
-- INSTRUCTIONS :
-- 1. Copier ce contenu
-- 2. Aller dans Supabase Dashboard > SQL Editor
-- 3. Coller et exécuter cette requête
-- 4. Retourner au formulaire d'ajout de produit
-- =====================================================
