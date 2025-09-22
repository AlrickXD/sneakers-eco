-- =====================================================
-- CORRECTION : Fonction RPC decrement_stock_by_sku
-- =====================================================

-- 1. Supprimer la fonction existante si elle existe
DROP FUNCTION IF EXISTS decrement_stock_by_sku(TEXT, INT);

-- 2. Recréer la fonction avec les bonnes permissions
CREATE OR REPLACE FUNCTION decrement_stock_by_sku(p_sku TEXT, p_qty INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Important pour l'accès via RPC
AS $$
BEGIN
  UPDATE product_variants
  SET stock = GREATEST(stock - p_qty, 0)
  WHERE sku = p_sku;
END;
$$;

-- 3. Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION decrement_stock_by_sku(TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_stock_by_sku(TEXT, INT) TO anon;

-- 4. Vérifier que la fonction est accessible
SELECT
  proname as function_name,
  prorettype::regtype as return_type
FROM pg_proc
WHERE proname = 'decrement_stock_by_sku';

-- =====================================================
-- NOTES :
-- - SECURITY DEFINER permet l'accès via API REST
-- - Permissions données à authenticated et anon
-- - Fonction recréée avec les bonnes options
-- =====================================================
