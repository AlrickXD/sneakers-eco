-- =====================================================
-- AJOUT DES INFORMATIONS DE LIVRAISON STRIPE
-- =====================================================

-- 1. Ajouter les colonnes pour les informations de livraison
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_name TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_line1 TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_line2 TEXT,
ADD COLUMN IF NOT EXISTS shipping_city TEXT,
ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT,
ADD COLUMN IF NOT EXISTS shipping_country TEXT;

-- 2. Vérifier que les colonnes ont été ajoutées
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

-- 3. Mettre à jour la fonction create_order_from_webhook pour inclure les infos de livraison
CREATE OR REPLACE FUNCTION create_order_from_webhook(
  p_user_id UUID,
  p_total_eur NUMERIC,
  p_items JSONB,
  p_stripe_session_id TEXT DEFAULT NULL,
  p_needs_label BOOLEAN DEFAULT FALSE,
  p_shipping_name TEXT DEFAULT NULL,
  p_shipping_address_line1 TEXT DEFAULT NULL,
  p_shipping_address_line2 TEXT DEFAULT NULL,
  p_shipping_city TEXT DEFAULT NULL,
  p_shipping_postal_code TEXT DEFAULT NULL,
  p_shipping_country TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_variant RECORD;
BEGIN
  -- Vérifier si une commande existe déjà pour cette session
  IF p_stripe_session_id IS NOT NULL THEN
    SELECT id INTO v_order_id FROM orders WHERE stripe_session_id = p_stripe_session_id;
    IF FOUND THEN
      RAISE NOTICE 'Commande déjà existante pour la session: %', p_stripe_session_id;
      RETURN v_order_id;
    END IF;
  END IF;

  -- Créer la commande avec toutes les informations
  INSERT INTO orders (
    user_id, 
    status, 
    total_eur, 
    stripe_session_id, 
    needs_label,
    shipping_name,
    shipping_address_line1,
    shipping_address_line2,
    shipping_city,
    shipping_postal_code,
    shipping_country
  )
  VALUES (
    p_user_id, 
    'paid', 
    p_total_eur, 
    p_stripe_session_id, 
    p_needs_label,
    p_shipping_name,
    p_shipping_address_line1,
    p_shipping_address_line2,
    p_shipping_city,
    p_shipping_postal_code,
    p_shipping_country
  )
  RETURNING id INTO v_order_id;
  
  -- Créer les order_items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Récupérer les infos de la variante
    SELECT prix_eur INTO v_variant
    FROM product_variants 
    WHERE sku = (v_item->>'sku');
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Variante non trouvée pour SKU: %', (v_item->>'sku');
    END IF;
    
    -- Créer l'order_item
    INSERT INTO order_items (order_id, sku, quantity, unit_price_eur)
    VALUES (
      v_order_id,
      v_item->>'sku',
      (v_item->>'quantity')::INT,
      v_variant.prix_eur
    );
    
    -- Décrémenter le stock
    PERFORM decrement_stock_by_sku(v_item->>'sku', (v_item->>'quantity')::INT);
  END LOOP;
  
  RAISE NOTICE 'Commande créée avec succès avec infos de livraison: %', v_order_id;
  RETURN v_order_id;
END;
$$;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ COLONNES DE LIVRAISON AJOUTÉES !';
    RAISE NOTICE 'Les commandes pourront maintenant stocker les informations de livraison Stripe.';
    RAISE NOTICE 'Fonction create_order_from_webhook mise à jour.';
END $$;
