-- =====================================================
-- TEST MANUEL DES INFORMATIONS DE LIVRAISON
-- =====================================================

-- 1. Insérer une commande de test avec informations de livraison
INSERT INTO orders (
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
  stripe_session_id
) VALUES (
  (SELECT id FROM auth.users LIMIT 1), -- Prendre le premier utilisateur
  'paid',
  99.99,
  'Jean Dupont Test',
  '123 Rue de la Paix',
  'Appartement 4B',
  'Paris',
  '75001',
  'France',
  true,
  'cs_test_manual_' || extract(epoch from now())::text
);

-- 2. Vérifier que la commande a été créée avec les infos de livraison
SELECT 
  id,
  shipping_name,
  shipping_address_line1,
  shipping_address_line2,
  shipping_city,
  shipping_postal_code,
  shipping_country,
  needs_label,
  created_at
FROM orders 
WHERE shipping_name = 'Jean Dupont Test';

-- 3. Compter les commandes avec infos de livraison
SELECT 
  COUNT(*) as total_orders,
  COUNT(shipping_name) as orders_with_shipping_name,
  COUNT(shipping_address_line1) as orders_with_address
FROM orders;

-- Message de test
DO $$
BEGIN
    RAISE NOTICE '✅ Commande de test créée avec informations de livraison !';
    RAISE NOTICE 'Vérifiez maintenant sur http://localhost:3001/seller/orders';
    RAISE NOTICE 'Vous devriez voir la section "📍 Adresse de livraison" pour cette commande.';
END $$;
