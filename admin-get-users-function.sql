-- =====================================================
-- FONCTION POUR RÉCUPÉRER LES UTILISATEURS AVEC EMAILS
-- =====================================================

-- D'abord, créer une vue pour les utilisateurs avec emails (plus simple)
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
  p.id,
  u.email,
  p.role,
  p.display_name,
  p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- Politique RLS pour la vue (admin seulement)
ALTER VIEW admin_users_view OWNER TO postgres;

-- Fonction alternative plus simple
CREATE OR REPLACE FUNCTION get_all_users_with_emails()
RETURNS TABLE (
  id UUID,
  email TEXT,
  role TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Vérifier le rôle de l'utilisateur actuel
  SELECT profiles.role INTO current_user_role 
  FROM profiles 
  WHERE profiles.id = auth.uid();
  
  -- Vérifier que l'utilisateur est admin
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent accéder à cette fonction';
  END IF;
  
  -- Retourner les utilisateurs avec leurs emails
  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(u.email, 'email-non-disponible@example.com') as email,
    p.role,
    p.display_name,
    p.created_at
  FROM profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  ORDER BY p.created_at DESC;
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION get_all_users_with_emails() TO authenticated;
GRANT SELECT ON admin_users_view TO authenticated;
