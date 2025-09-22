-- =====================================================
-- DIAGNOSTIC DES COMMANDES - PROBLÈME D'AFFICHAGE
-- =====================================================

-- 1. Vérifier s'il y a des commandes dans la base
SELECT 
  'Total commandes' as info,
  COUNT(*) as count
FROM orders;

-- 2. Vérifier les commandes récentes
SELECT 
  id,
  user_id,
  status,
  total_eur,
  needs_label,
  created_at,
  stripe_session_id
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Vérifier les order_items
SELECT 
  'Total order_items' as info,
  COUNT(*) as count
FROM order_items;

-- 4. Vérifier les politiques RLS sur la table orders
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'orders';

-- 5. Vérifier si RLS est activé sur orders
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'orders';

-- 6. Tester une requête simple pour voir les commandes
-- (Cette requête devrait fonctionner même avec RLS)
SELECT 
  o.id,
  o.user_id,
  o.status,
  o.total_eur,
  o.needs_label,
  o.created_at,
  COUNT(oi.id) as items_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.user_id, o.status, o.total_eur, o.needs_label, o.created_at
ORDER BY o.created_at DESC;

-- 7. Vérifier la structure de la table orders
\d orders;

-- Message de diagnostic
DO $$
BEGIN
    RAISE NOTICE '🔍 Diagnostic des commandes terminé !';
    RAISE NOTICE 'Vérifiez les résultats ci-dessus pour identifier le problème.';
END $$;
