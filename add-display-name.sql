-- =====================================================
-- AJOUTER LA COLONNE DISPLAY_NAME SI ELLE N'EXISTE PAS
-- =====================================================

-- 1. Ajouter la colonne display_name à la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 2. Ajouter une colonne updated_at pour tracker les modifications
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Créer un trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Appliquer le trigger à la table profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Vérifier la structure finale
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- RÉSULTAT ATTENDU
-- =====================================================
-- La table profiles devrait maintenant avoir :
-- - id (UUID)
-- - role (TEXT)
-- - display_name (TEXT) ← NOUVEAU
-- - created_at (TIMESTAMPTZ)
-- - updated_at (TIMESTAMPTZ) ← NOUVEAU avec trigger
-- =====================================================
