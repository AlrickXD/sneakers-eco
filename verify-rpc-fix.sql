-- =====================================================
-- VÉRIFICATION : Fonction RPC après correction
-- =====================================================

-- 1. Vérifier l'existence de la fonction
SELECT
  proname as function_name,
  pronargs as arg_count,
  prorettype::regtype as return_type,
  prosecdef as security_definer
FROM pg_proc
WHERE proname = 'decrement_stock_by_sku';

-- 2. Vérifier les permissions
SELECT
  grantee,
  privilege_type
FROM information_schema.role_routine_grants
WHERE routine_name = 'decrement_stock_by_sku';

-- 3. Tester la fonction avec un SKU existant (remplacez TEST-SKU par un vrai SKU)
-- SELECT decrement_stock_by_sku('NIKE-DUNK-LOW-36-SECONDE-MAIN-1758468965921-gmprrj-36-seconde_main', 1);

-- 4. Vérifier les politiques RLS
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
WHERE tablename = 'product_variants'
  AND cmd = 'UPDATE';

-- =====================================================
-- RÉSULTATS ATTENDUS :
-- - Fonction existe avec SECURITY DEFINER = true
-- - Permissions accordées à authenticated et anon
-- - Politiques RLS permettent l'UPDATE
-- =====================================================
