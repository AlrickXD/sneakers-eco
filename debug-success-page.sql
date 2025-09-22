-- =====================================================
-- DIAGNOSTIC DE LA PAGE DE SUCCÈS - SESSION_ID MANQUANT
-- =====================================================

-- 1. Vérifier si les commandes ont des stripe_session_id
SELECT 
  id,
  user_id,
  status,
  total_eur,
  stripe_session_id,
  needs_label,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Compter les commandes avec et sans stripe_session_id
SELECT 
  'Avec stripe_session_id' as type,
  COUNT(*) as count
FROM orders 
WHERE stripe_session_id IS NOT NULL AND stripe_session_id != ''
UNION ALL
SELECT 
  'Sans stripe_session_id' as type,
  COUNT(*) as count
FROM orders 
WHERE stripe_session_id IS NULL OR stripe_session_id = '';

-- 3. Vérifier les commandes récentes avec leurs détails complets
SELECT 
  o.id,
  o.user_id,
  o.status,
  o.total_eur,
  o.stripe_session_id,
  o.needs_label,
  o.created_at,
  COUNT(oi.id) as items_count,
  STRING_AGG(pv.name, ', ') as product_names
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN product_variants pv ON oi.sku = pv.sku
WHERE o.created_at >= NOW() - INTERVAL '7 days'
GROUP BY o.id, o.user_id, o.status, o.total_eur, o.stripe_session_id, o.needs_label, o.created_at
ORDER BY o.created_at DESC;

-- 4. Vérifier si la fonction webhook fonctionne correctement
SELECT 
  'Fonction create_order_from_webhook existe' as check,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'create_order_from_webhook'
    ) THEN 'OUI' 
    ELSE 'NON' 
  END as result;

-- Message de diagnostic
DO $$
BEGIN
    RAISE NOTICE '🔍 Diagnostic de la page de succès terminé !';
    RAISE NOTICE 'Vérifiez si les commandes ont bien leur stripe_session_id.';
    RAISE NOTICE 'Si elles n''en ont pas, le webhook ne fonctionne pas correctement.';
END $$;
