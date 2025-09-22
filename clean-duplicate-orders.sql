-- =====================================================
-- NETTOYAGE DES COMMANDES EN DOUBLE
-- =====================================================

-- 1. Voir les commandes en double
SELECT 
  user_id,
  total_eur,
  DATE(created_at) as order_date,
  COUNT(*) as count,
  MIN(created_at) as first_order,
  MAX(created_at) as last_order
FROM orders 
GROUP BY user_id, total_eur, DATE(created_at)
HAVING COUNT(*) > 1
ORDER BY DATE(created_at) DESC;

-- 2. Supprimer les doublons (garde la plus ancienne par groupe)
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, total_eur, DATE(created_at) 
      ORDER BY created_at ASC
    ) as rn
  FROM orders
)
DELETE FROM orders 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. Vérifier le résultat
SELECT 
  COUNT(*) as total_orders,
  COUNT(DISTINCT user_id) as unique_users
FROM orders;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Nettoyage des doublons terminé !';
    RAISE NOTICE 'Seules les premières commandes de chaque groupe ont été conservées.';
END $$;
