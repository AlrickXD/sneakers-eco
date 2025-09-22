-- === Section 1: Vérifier l'utilisateur (avec explication) ===
-- Cette section vérifie si vous êtes connecté dans Supabase

SELECT
  '=== INSTRUCTIONS ===' as section,
  '1. Dans Supabase SQL Editor, cliquez sur "Connect" en haut à droite' as instruction_1,
  '2. Choisissez "Direct connection" avec URI' as instruction_2,
  '3. Connectez-vous avec votre compte vendeur: alrickadote@gmail.com' as instruction_3,
  '4. Exécutez cette requête après connexion' as instruction_4;

-- Vérification de l'authentification
SELECT
  '=== RÉSULTAT ATTENDU APRÈS CONNEXION ===' as section,
  auth.uid() as user_id,
  CASE WHEN auth.uid() IS NOT NULL THEN 'AUTHENTIFIÉ' ELSE 'NON AUTHENTIFIÉ' END as status;
