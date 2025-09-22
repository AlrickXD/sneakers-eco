-- =====================================================
-- AJOUT DE LA COLONNE EMAIL CLIENT - ÉTAPE PAR ÉTAPE
-- =====================================================

-- 1. Vérifier d'abord la structure actuelle de la table orders
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY column_name;

-- 2. Ajouter la colonne customer_email
ALTER TABLE orders 
ADD COLUMN customer_email TEXT;

-- 3. Vérifier que la colonne a été ajoutée
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'customer_email';

-- 4. Vérifier quelques commandes existantes (elles auront customer_email = NULL)
SELECT 
  id, 
  user_id, 
  status, 
  total_eur, 
  customer_email,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Colonne customer_email ajoutée à la table orders !';
    RAISE NOTICE 'Les nouvelles commandes pourront maintenant stocker l''email client.';
    RAISE NOTICE 'Les commandes existantes auront customer_email = NULL (normal).';
END $$;
