-- =====================================================
-- AJOUT DE L'EMAIL CLIENT DEPUIS STRIPE
-- =====================================================

-- 1. Ajouter la colonne pour l'email du client
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- 2. Vérifier que la colonne a été ajoutée
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'customer_email';

-- 3. Mettre à jour la fonction create_order_from_webhook pour inclure l'email
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
  p_shipping_country TEXT DEFAULT NULL,
  p_customer_email TEXT DEFAULT NULL
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

  -- Créer la commande avec toutes les informations incluant l'email
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
    shipping_country,
    customer_email
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
    p_shipping_country,
    p_customer_email
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
  
  RAISE NOTICE 'Commande créée avec succès avec email: %', v_order_id;
  RETURN v_order_id;
END;
$$;

-- 4. Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION create_order_from_webhook TO service_role;

-- 5. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Colonne customer_email ajoutée !';
    RAISE NOTICE '✅ Fonction create_order_from_webhook mise à jour !';
    RAISE NOTICE 'L''email du client sera maintenant stocké dans les commandes.';
END $$;
