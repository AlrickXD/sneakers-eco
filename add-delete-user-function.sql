-- =====================================================
-- FONCTION DE SUPPRESSION DE COMPTE UTILISATEUR
-- =====================================================

-- Créer une fonction pour supprimer un utilisateur et toutes ses données
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer le profil utilisateur (les autres données seront supprimées via CASCADE)
  DELETE FROM profiles WHERE id = auth.uid();
  
  -- Note: Supabase supprimera automatiquement l'utilisateur de auth.users
  -- si toutes les références sont supprimées
END;
$$;

-- Donner les permissions d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Fonction de suppression de compte créée !';
    RAISE NOTICE 'Les utilisateurs peuvent maintenant supprimer leur compte.';
END $$;
