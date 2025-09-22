-- =====================================================
-- CORRECTION DES POLITIQUES POUR LE WEBHOOK STRIPE
-- =====================================================

-- 1. Ajouter une politique pour permettre au service role de créer des commandes
DROP POLICY IF EXISTS "Service role can manage orders" ON orders;
CREATE POLICY "Service role can manage orders" ON orders
FOR ALL USING (
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.role() = 'service_role'
);

-- 2. Ajouter une politique pour permettre au service role de créer des order_items  
DROP POLICY IF EXISTS "Service role can manage order_items" ON order_items;
CREATE POLICY "Service role can manage order_items" ON order_items
FOR ALL USING (
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.role() = 'service_role'
);

-- 3. Permettre au service role de modifier les product_variants (pour le stock)
DROP POLICY IF EXISTS "Service role can update product_variants" ON product_variants;
CREATE POLICY "Service role can update product_variants" ON product_variants
FOR UPDATE USING (
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.role() = 'service_role'
);

-- 4. Améliorer la fonction decrement_stock_by_sku pour plus de robustesse
CREATE OR REPLACE FUNCTION decrement_stock_by_sku(p_sku TEXT, p_qty INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que le SKU existe
  IF NOT EXISTS (SELECT 1 FROM product_variants WHERE sku = p_sku) THEN
    RAISE EXCEPTION 'SKU non trouvé: %', p_sku;
  END IF;

  -- Décrémenter le stock
  UPDATE product_variants
  SET stock = GREATEST(stock - p_qty, 0)
  WHERE sku = p_sku;
  
  -- Vérifier que la mise à jour a bien eu lieu
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Impossible de mettre à jour le stock pour SKU: %', p_sku;
  END IF;
  
  RAISE NOTICE 'Stock décrémenté avec succès - SKU: %, Quantité: %', p_sku, p_qty;
END;
$$;

-- 5. Créer une fonction pour créer une commande depuis le webhook
CREATE OR REPLACE FUNCTION create_order_from_webhook(
  p_user_id UUID,
  p_total_eur NUMERIC,
  p_items JSONB
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
  -- Créer la commande
  INSERT INTO orders (user_id, status, total_eur)
  VALUES (p_user_id, 'paid', p_total_eur)
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

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION create_order_from_webhook TO service_role;
GRANT EXECUTE ON FUNCTION decrement_stock_by_sku TO service_role;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Politiques webhook corrigées !';
    RAISE NOTICE 'Le webhook peut maintenant créer des commandes en base de données.';
END $$;
