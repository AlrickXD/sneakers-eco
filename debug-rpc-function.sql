-- =====================================================
-- DEBUG : Fonction RPC decrement_stock_by_sku
-- =====================================================

-- 1. Vérifier si la fonction existe
SELECT
  proname as function_name,
  pronargs as arg_count,
  prorettype::regtype as return_type
FROM pg_proc
WHERE proname = 'decrement_stock_by_sku';

-- 2. Vérifier les permissions sur la fonction
SELECT
  grantee,
  privilege_type
FROM information_schema.role_routine_grants
WHERE routine_name = 'decrement_stock_by_sku';

-- 3. Tester la fonction manuellement
SELECT decrement_stock_by_sku('TEST-SKU', 1);

-- 4. Vérifier les politiques RLS sur product_variants
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
WHERE tablename = 'product_variants';

-- =====================================================
-- NOTES :
-- - Vérifie l'existence de la fonction
-- - Vérifie les permissions
-- - Teste la fonction
-- - Vérifie les politiques RLS
-- =====================================================
