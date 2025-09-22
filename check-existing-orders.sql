-- =====================================================
-- VÉRIFICATION DES COMMANDES EXISTANTES
-- =====================================================

-- 1. Voir toutes les commandes récentes avec leurs infos de livraison
SELECT 
  id,
  user_id,
  status,
  total_eur,
  shipping_name,
  shipping_address_line1,
  shipping_city,
  shipping_country,
  needs_label,
  stripe_session_id,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Statistiques des informations de livraison
SELECT 
  'Total commandes' as type,
  COUNT(*) as count
FROM orders
UNION ALL
SELECT 
  'Avec nom livraison' as type,
  COUNT(*) as count
FROM orders 
WHERE shipping_name IS NOT NULL AND shipping_name != ''
UNION ALL
SELECT 
  'Avec adresse livraison' as type,
  COUNT(*) as count
FROM orders 
WHERE shipping_address_line1 IS NOT NULL AND shipping_address_line1 != ''
UNION ALL
SELECT 
  'Avec ville livraison' as type,
  COUNT(*) as count
FROM orders 
WHERE shipping_city IS NOT NULL AND shipping_city != '';

-- 3. Voir les commandes avec au moins une info de livraison
SELECT 
  id,
  shipping_name,
  shipping_address_line1,
  shipping_city,
  shipping_country,
  created_at
FROM orders 
WHERE (
  shipping_name IS NOT NULL 
  OR shipping_address_line1 IS NOT NULL 
  OR shipping_city IS NOT NULL
)
ORDER BY created_at DESC;

-- Message d'information
DO $$
BEGIN
    RAISE NOTICE '📊 Vérification des commandes terminée !';
    RAISE NOTICE 'Si aucune commande n''a d''informations de livraison, le problème vient du webhook.';
END $$;
