-- =====================================================
-- DIAGNOSTIC EMAIL CLIENT - VÉRIFICATION COMPLÈTE
-- =====================================================

-- 1. Vérifier si la colonne customer_email existe
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'customer_email';

-- 2. Vérifier la structure complète de la table orders
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 3. Vérifier les fonctions create_order_from_webhook existantes
SELECT 
  proname, 
  pg_get_function_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname = 'create_order_from_webhook';

-- 4. Vérifier les dernières commandes et leurs emails
SELECT 
  id, 
  user_id, 
  status, 
  total_eur, 
  CASE 
    WHEN customer_email IS NULL THEN 'NULL (pas d''email)'
    WHEN customer_email = '' THEN 'VIDE'
    ELSE customer_email 
  END as customer_email_status,
  stripe_session_id,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Compter les commandes avec et sans email
SELECT 
  'Commandes avec email' as type,
  COUNT(*) as count
FROM orders 
WHERE customer_email IS NOT NULL AND customer_email != ''
UNION ALL
SELECT 
  'Commandes sans email' as type,
  COUNT(*) as count
FROM orders 
WHERE customer_email IS NULL OR customer_email = '';

-- 6. Message de diagnostic
DO $$
BEGIN
    RAISE NOTICE '=== DIAGNOSTIC EMAIL CLIENT ===';
    RAISE NOTICE 'Vérifiez les résultats ci-dessus pour identifier le problème :';
    RAISE NOTICE '1. La colonne customer_email existe-t-elle ?';
    RAISE NOTICE '2. La fonction create_order_from_webhook a-t-elle le paramètre p_customer_email ?';
    RAISE NOTICE '3. Les nouvelles commandes ont-elles customer_email rempli ?';
END $$;
