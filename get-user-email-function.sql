-- =====================================================
-- FONCTION RPC POUR RÉCUPÉRER L'EMAIL DES UTILISATEURS
-- =====================================================

-- Fonction pour récupérer l'email d'un utilisateur (accessible aux vendeurs/admins)
CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Vérifier que l'utilisateur courant est vendeur ou admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('vendeur', 'admin')
  ) THEN
    RETURN 'Non autorisé';
  END IF;

  -- Récupérer l'email depuis auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;

  -- Retourner l'email ou un message par défaut
  RETURN COALESCE(user_email, 'Email non disponible');
END;
$$;

-- Fonction pour récupérer les informations complètes des utilisateurs pour les commandes
CREATE OR REPLACE FUNCTION get_orders_with_user_details()
RETURNS TABLE (
  order_id UUID,
  user_id UUID,
  user_email TEXT,
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

  -- Retourner les commandes avec les détails utilisateur
  RETURN QUERY
  SELECT 
    o.id as order_id,
    o.user_id,
    COALESCE(au.email, 'Email non disponible') as user_email,
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
  LEFT JOIN auth.users au ON au.id = o.user_id
  LEFT JOIN profiles p ON p.id = o.user_id
  ORDER BY o.created_at DESC;
END;
$$;

-- Accorder les permissions appropriées
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_orders_with_user_details() TO authenticated;
