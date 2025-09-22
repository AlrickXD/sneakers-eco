-- =====================================================
-- VÉRIFIER LA STRUCTURE DE LA TABLE PROFILES
-- =====================================================

-- 1. Voir la structure de la table profiles
\d profiles;

-- 2. Alternative pour voir les colonnes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- 3. Voir quelques enregistrements existants pour comprendre la structure
SELECT * FROM profiles LIMIT 3;

-- 4. Voir aussi la structure de auth.users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
LIMIT 10;
