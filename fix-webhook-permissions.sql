-- =====================================================
-- CORRECTION DES PERMISSIONS WEBHOOK POUR LES COMMANDES
-- =====================================================

-- 1. Mettre à jour la fonction create_order_from_webhook pour bypasser RLS
CREATE OR REPLACE FUNCTION create_order_from_webhook(
  p_user_id UUID,
  p_total_eur NUMERIC,
  p_items JSONB,
  p_stripe_session_id TEXT DEFAULT NULL,
  p_needs_label BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Important : cette fonction s'exécute avec les privilèges du propriétaire
SET search_path = public
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

  -- Créer la commande avec le champ needs_label (bypass RLS avec SECURITY DEFINER)
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
    
    -- Créer l'order_item (bypass RLS avec SECURITY DEFINER)
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

-- 2. Donner les permissions nécessaires à la fonction
-- (Supabase gère automatiquement les permissions pour les fonctions SECURITY DEFINER)

-- 3. Alternative : créer des politiques plus permissives pour les insertions webhook
-- Si la fonction ne fonctionne pas, utiliser cette approche :

-- Politique temporaire pour permettre les insertions webhook
CREATE POLICY IF NOT EXISTS "orders_webhook_insert" ON orders
FOR INSERT
TO authenticated
WITH CHECK (true); -- Permet toutes les insertions (à utiliser temporairement)

CREATE POLICY IF NOT EXISTS "order_items_webhook_insert" ON order_items
FOR INSERT
TO authenticated
WITH CHECK (true); -- Permet toutes les insertions (à utiliser temporairement)

-- 4. Vérifier que la fonction decrement_stock_by_sku existe et fonctionne
CREATE OR REPLACE FUNCTION decrement_stock_by_sku(p_sku TEXT, p_qty INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_variants
  SET stock = GREATEST(stock - p_qty, 0)
  WHERE sku = p_sku;
  
  IF NOT FOUND THEN
    RAISE WARNING 'SKU non trouvé pour la décrémentation du stock: %', p_sku;
  END IF;
END;
$$;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Permissions webhook corrigées !';
    RAISE NOTICE 'La fonction create_order_from_webhook peut maintenant bypasser RLS.';
    RAISE NOTICE 'Des politiques temporaires permettent les insertions webhook.';
END $$;
