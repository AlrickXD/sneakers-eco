-- === SECTION 3: Compter les variantes ===
SELECT
  '=== VARIANTES ===' as section,
  COUNT(*) as total_variantes
FROM product_variants;
