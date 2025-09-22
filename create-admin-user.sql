-- =====================================================
-- CRÉATION D'UN UTILISATEUR ADMIN
-- =====================================================

-- ÉTAPE 1: Créer un utilisateur admin via Supabase Dashboard
-- 1. Allez dans Supabase Dashboard > Authentication > Users
-- 2. Cliquez sur "Add user"
-- 3. Email: admin@sneakers-eco.com
-- 4. Password: AdminSecure2024!
-- 5. Cochez "Auto Confirm User"

-- ÉTAPE 2: Mettre à jour le rôle en admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'admin@sneakers-eco.com'
);

-- ÉTAPE 3: Vérifier la création
SELECT 
  u.email,
  p.role,
  p.display_name,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@sneakers-eco.com';

-- =====================================================
-- FONCTIONS ADMIN SUPPLÉMENTAIRES
-- =====================================================

-- Fonction pour changer le rôle d'un utilisateur (admin uniquement)
CREATE OR REPLACE FUNCTION change_user_role(
  target_user_id UUID,
  new_role TEXT,
  admin_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role TEXT;
BEGIN
  -- Vérifier que l'utilisateur qui fait la demande est admin
  SELECT role INTO admin_role 
  FROM profiles 
  WHERE id = admin_user_id;
  
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent changer les rôles';
  END IF;
  
  -- Vérifier que le nouveau rôle est valide
  IF new_role NOT IN ('client', 'vendeur', 'admin') THEN
    RAISE EXCEPTION 'Rôle invalide. Utilisez: client, vendeur, ou admin';
  END IF;
  
  -- Mettre à jour le rôle
  UPDATE profiles 
  SET role = new_role 
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- Fonction pour obtenir les statistiques de la plateforme
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_clients', (SELECT COUNT(*) FROM profiles WHERE role = 'client'),
    'total_vendeurs', (SELECT COUNT(*) FROM profiles WHERE role = 'vendeur'),
    'total_admins', (SELECT COUNT(*) FROM profiles WHERE role = 'admin'),
    'total_products', (SELECT COUNT(*) FROM products),
    'total_orders', (SELECT COUNT(*) FROM orders),
    'total_revenue', (SELECT COALESCE(SUM(total_eur), 0) FROM orders WHERE status = 'paid'),
    'pending_orders', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
    'paid_orders', (SELECT COUNT(*) FROM orders WHERE status = 'paid')
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Fonction pour supprimer un utilisateur (admin uniquement)
CREATE OR REPLACE FUNCTION delete_user_admin(
  target_user_id UUID,
  admin_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_role TEXT;
  target_role TEXT;
BEGIN
  -- Vérifier que l'utilisateur qui fait la demande est admin
  SELECT role INTO admin_role 
  FROM profiles 
  WHERE id = admin_user_id;
  
  IF admin_role != 'admin' THEN
    RAISE EXCEPTION 'Seuls les administrateurs peuvent supprimer des utilisateurs';
  END IF;
  
  -- Vérifier qu'on ne supprime pas un autre admin
  SELECT role INTO target_role 
  FROM profiles 
  WHERE id = target_user_id;
  
  IF target_role = 'admin' THEN
    RAISE EXCEPTION 'Impossible de supprimer un autre administrateur';
  END IF;
  
  -- Supprimer le profil (cascade vers auth.users)
  DELETE FROM profiles WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- =====================================================
-- POLITIQUES RLS POUR L'ADMIN
-- =====================================================

-- Les admins peuvent tout voir et modifier
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) AND role != 'admin'  -- Empêcher la suppression d'autres admins
  );

-- Les admins peuvent voir toutes les commandes
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- INFORMATIONS DE CONNEXION ADMIN
-- =====================================================
-- Email: admin@sneakers-eco.com
-- Mot de passe: AdminSecure2024!
-- Rôle: admin
-- =====================================================
