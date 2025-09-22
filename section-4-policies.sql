-- === SECTION 4: Vérifier les politiques RLS ===
SELECT
  '=== POLITIQUES RLS ===' as section,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('products', 'product_variants')
ORDER BY tablename, policyname;
