-- =====================================================
-- CRÉER UN PROFIL VENDEUR POUR TEST - VERSION CORRIGÉE
-- =====================================================

-- 1. D'abord, vérifier la structure de la table profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- 2. Voir les profils existants pour comprendre la structure
SELECT * FROM profiles LIMIT 3;

-- =====================================================
-- MÉTHODE RECOMMANDÉE : INSCRIPTION NORMALE + CHANGEMENT DE RÔLE
-- =====================================================

-- ÉTAPE 1: Inscrivez-vous normalement sur le site avec :
-- Email: vendeur@test.com
-- Mot de passe: motdepasse123

-- ÉTAPE 2: Une fois inscrit, exécutez cette requête pour changer le rôle :
UPDATE profiles 
SET role = 'vendeur' 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'vendeur@test.com'
);

-- ÉTAPE 3: Vérifier le changement (adapter selon les vraies colonnes)
SELECT 
  id,
  role,
  created_at
FROM profiles
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'vendeur@test.com'
);

-- =====================================================
-- ALTERNATIVE : CHANGER UN UTILISATEUR EXISTANT
-- =====================================================

-- Si vous avez déjà un compte, remplacez 'votre-email@example.com' par votre email :
-- UPDATE profiles 
-- SET role = 'vendeur' 
-- WHERE id = (
--   SELECT id 
--   FROM auth.users 
--   WHERE email = 'votre-email@example.com'
-- );

-- =====================================================
-- VÉRIFIER TOUS LES UTILISATEURS
-- =====================================================

-- Voir tous les profils avec leurs emails (jointure avec auth.users)
SELECT 
  u.email,
  p.role,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
ORDER BY p.created_at DESC;

-- =====================================================
-- INFORMATIONS DE CONNEXION
-- =====================================================
-- Email: vendeur@test.com
-- Mot de passe: motdepasse123
-- Rôle: vendeur (après exécution du script)
-- =====================================================
