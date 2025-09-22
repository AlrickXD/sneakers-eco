-- =====================================================
-- FONCTION SIMPLIFIÉE POUR LES COMMANDES AVEC NOMS
-- (Sans accès aux emails pour éviter les problèmes de permissions)
-- =====================================================

-- Fonction simplifiée qui récupère les commandes avec les noms d'affichage
CREATE OR REPLACE FUNCTION get_orders_with_names()
RETURNS TABLE (
  order_id UUID,
  user_id UUID,
  user_name TEXT,
  status TEXT,
  total_eur NUMERIC,
  needs_label BOOLEAN,
  shipping_name TEXT,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur courant est vendeur ou admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('vendeur', 'admin')
  ) THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;

  -- Retourner les commandes avec les noms d'affichage uniquement
  RETURN QUERY
  SELECT 
    o.id as order_id,
    o.user_id,
    COALESCE(p.display_name, 'Nom non disponible') as user_name,
    o.status,
    o.total_eur,
    o.needs_label,
    o.shipping_name,
    o.shipping_address_line1,
    o.shipping_address_line2,
    o.shipping_city,
    o.shipping_postal_code,
    o.shipping_country,
    o.created_at
  FROM orders o
  LEFT JOIN profiles p ON p.id = o.user_id
  ORDER BY o.created_at DESC;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION get_orders_with_names() TO authenticated;
