-- =====================================================
-- DIAGNOSTIC DES PERMISSIONS POUR LA PAGE DE SUCCÈS
-- =====================================================

-- 1. Vérifier les politiques RLS sur orders
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- 2. Vérifier les politiques RLS sur order_items
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'order_items'
ORDER BY policyname;

-- 3. Vérifier si RLS est activé
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('orders', 'order_items', 'product_variants');

-- 4. Test simple d'accès aux données
-- (Cette requête simule ce que fait la page de succès)
SELECT 
  'Test accès orders' as test,
  COUNT(*) as count
FROM orders
WHERE status = 'paid';

-- 5. Test avec relations
SELECT 
  'Test accès avec relations' as test,
  COUNT(*) as count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN product_variants pv ON oi.sku = pv.sku
WHERE o.status = 'paid';

-- 6. Vérifier les commandes récentes avec leurs session_id
SELECT 
  id,
  user_id,
  stripe_session_id,
  status,
  created_at,
  needs_label
FROM orders
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 5;

-- Message de diagnostic
DO $$
BEGIN
    RAISE NOTICE '🔍 Diagnostic des permissions terminé !';
    RAISE NOTICE 'Vérifiez les politiques RLS et les données de test ci-dessus.';
    RAISE NOTICE 'Si les requêtes échouent, il y a un problème de permissions.';
END $$;
