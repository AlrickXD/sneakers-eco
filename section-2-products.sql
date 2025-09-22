-- === SECTION 2: Compter les produits ===
SELECT
  '=== PRODUITS ===' as section,
  COUNT(*) as total_produits
FROM products;
