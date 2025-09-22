-- =====================================================
-- AJOUT SIMPLE DE LA COLONNE EMAIL CLIENT
-- (Sans modifier la fonction existante)
-- =====================================================

-- 1. Ajouter seulement la colonne pour l'email du client
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- 2. Vérifier que la colonne a été ajoutée
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'customer_email';

-- 3. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Colonne customer_email ajoutée !';
    RAISE NOTICE 'Vous devrez mettre à jour manuellement la fonction create_order_from_webhook';
    RAISE NOTICE 'pour passer le paramètre p_customer_email.';
END $$;
