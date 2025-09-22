-- =====================================================
-- DIAGNOSTIC ET CORRECTION DU WEBHOOK STRIPE
-- =====================================================

-- 1. Vérifier que les tables existent
SELECT 
  'orders' as table_name,
  COUNT(*) as row_count
FROM orders
UNION ALL
SELECT 
  'order_items' as table_name,
  COUNT(*) as row_count  
FROM order_items
UNION ALL
SELECT 
  'product_variants' as table_name,
  COUNT(*) as row_count
FROM product_variants;

-- 2. Vérifier les dernières commandes créées
SELECT 
  id,
  user_id,
  status,
  total_eur,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Vérifier la fonction decrement_stock_by_sku
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'decrement_stock_by_sku';

-- 4. Créer la fonction decrement_stock_by_sku si elle n'existe pas
CREATE OR REPLACE FUNCTION decrement_stock_by_sku(p_sku TEXT, p_qty INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE product_variants
  SET stock = GREATEST(stock - p_qty, 0)
  WHERE sku = p_sku;
  
  -- Log pour debug
  RAISE NOTICE 'Stock décrémenté pour SKU: %, quantité: %', p_sku, p_qty;
END;
$$;

-- 5. Vérifier les politiques RLS sur les tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'product_variants')
ORDER BY tablename, policyname;

-- Message de diagnostic
DO $$
BEGIN
    RAISE NOTICE '✅ Diagnostic terminé !';
    RAISE NOTICE 'Vérifiez les résultats ci-dessus pour identifier les problèmes.';
END $$;
