-- =====================================================
-- CORRECTION DU PROBLÈME D'INSCRIPTION VENDEUR
-- =====================================================

-- 1. Corriger le trigger pour prendre en compte le rôle des métadonnées
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'display_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$;

-- 2. Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Trigger corrigé pour prendre en compte le rôle vendeur !';
END $$;
