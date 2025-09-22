-- =====================================================
-- TEST DE LA COLONNE STRIPE_SESSION_ID
-- =====================================================

-- 1. Vérifier que la colonne existe maintenant
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'stripe_session_id';

-- 2. Vérifier les commandes existantes
SELECT 
  id,
  user_id,
  stripe_session_id,
  status,
  total_eur,
  needs_label,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Compter les commandes avec et sans stripe_session_id
SELECT 
  CASE 
    WHEN stripe_session_id IS NOT NULL AND stripe_session_id != '' 
    THEN 'Avec stripe_session_id' 
    ELSE 'Sans stripe_session_id' 
  END as type,
  COUNT(*) as count
FROM orders
GROUP BY 
  CASE 
    WHEN stripe_session_id IS NOT NULL AND stripe_session_id != '' 
    THEN 'Avec stripe_session_id' 
    ELSE 'Sans stripe_session_id' 
  END;

-- Message de test
DO $$
BEGIN
    RAISE NOTICE '✅ Test de la colonne stripe_session_id terminé !';
    RAISE NOTICE 'Vérifiez les résultats ci-dessus.';
    RAISE NOTICE 'Les nouvelles commandes devraient avoir un stripe_session_id.';
END $$;
