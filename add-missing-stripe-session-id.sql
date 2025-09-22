-- =====================================================
-- CORRECTION URGENTE : AJOUTER LA COLONNE STRIPE_SESSION_ID
-- =====================================================

-- Le problème est que la colonne stripe_session_id n'existe pas dans la table orders
-- C'est pourquoi la page de succès ne peut pas identifier la bonne commande

-- 1. Vérifier si la colonne existe déjà
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'stripe_session_id';

-- 2. Ajouter la colonne stripe_session_id si elle n'existe pas
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- 3. Créer un index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);

-- 4. Vérifier que la colonne a été ajoutée
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'stripe_session_id';

-- 5. Mettre à jour la fonction create_order_from_webhook pour utiliser cette colonne
CREATE OR REPLACE FUNCTION create_order_from_webhook(
  p_user_id UUID,
  p_total_eur NUMERIC,
  p_items JSONB,
  p_stripe_session_id TEXT DEFAULT NULL,
  p_needs_label BOOLEAN DEFAULT FALSE
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

  -- Créer la commande avec le champ needs_label ET stripe_session_id
  INSERT INTO orders (user_id, status, total_eur, stripe_session_id, needs_label)
  VALUES (p_user_id, 'paid', p_total_eur, p_stripe_session_id, p_needs_label)
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
  
  RAISE NOTICE 'Commande créée avec succès: %', v_order_id;
  RETURN v_order_id;
END;
$$;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ COLONNE STRIPE_SESSION_ID AJOUTÉE !';
    RAISE NOTICE 'La page de succès pourra maintenant identifier la bonne commande.';
    RAISE NOTICE 'Fonction create_order_from_webhook mise à jour.';
END $$;
