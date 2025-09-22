-- =====================================================
-- CORRECTION COMPLÈTE : Accès RPC aux fonctions
-- =====================================================

-- 1. Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS decrement_stock_by_sku(TEXT, INT);

-- 2. Recréer la fonction avec les bonnes options pour l'API REST
CREATE OR REPLACE FUNCTION decrement_stock_by_sku(p_sku TEXT, p_qty INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- NÉCESSAIRE pour l'accès via API REST
AS $$
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Décrémenter le stock
  UPDATE product_variants
  SET stock = GREATEST(stock - p_qty, 0)
  WHERE sku = p_sku;

  -- Vérifier que la mise à jour a affecté au moins une ligne
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SKU not found: %', p_sku;
  END IF;
END;
$$;

-- 3. Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION decrement_stock_by_sku(TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_stock_by_sku(TEXT, INT) TO anon;

-- 4. Vérifier que la fonction est accessible via RPC
SELECT
  proname as function_name,
  prorettype::regtype as return_type,
  prosecdef as security_definer
FROM pg_proc
WHERE proname = 'decrement_stock_by_sku';

-- 5. Tester la fonction
SELECT decrement_stock_by_sku('TEST-SKU', 1);

-- =====================================================
-- NOTES :
-- - SECURITY DEFINER : nécessaire pour API REST
-- - Vérification d'authentification
-- - Permissions explicites
-- - Test de la fonction
-- =====================================================
