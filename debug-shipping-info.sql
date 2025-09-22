-- =====================================================
-- DIAGNOSTIC DES INFORMATIONS DE LIVRAISON
-- =====================================================

-- 1. Vérifier que les colonnes de livraison existent
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN (
  'shipping_name', 
  'shipping_address_line1', 
  'shipping_address_line2', 
  'shipping_city', 
  'shipping_postal_code', 
  'shipping_country'
)
ORDER BY column_name;

-- 2. Vérifier les commandes récentes avec leurs infos de livraison
SELECT 
  id,
  user_id,
  status,
  total_eur,
  shipping_name,
  shipping_address_line1,
  shipping_address_line2,
  shipping_city,
  shipping_postal_code,
  shipping_country,
  needs_label,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Compter les commandes avec et sans infos de livraison
SELECT 
  CASE 
    WHEN shipping_name IS NOT NULL OR shipping_address_line1 IS NOT NULL 
    THEN 'Avec infos de livraison' 
    ELSE 'Sans infos de livraison' 
  END as type,
  COUNT(*) as count
FROM orders
GROUP BY 
  CASE 
    WHEN shipping_name IS NOT NULL OR shipping_address_line1 IS NOT NULL 
    THEN 'Avec infos de livraison' 
    ELSE 'Sans infos de livraison' 
  END;

-- 4. Vérifier la structure complète de la table orders
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Message de diagnostic
DO $$
BEGIN
    RAISE NOTICE '🔍 Diagnostic des informations de livraison terminé !';
    RAISE NOTICE 'Vérifiez les résultats ci-dessus pour identifier le problème.';
END $$;
