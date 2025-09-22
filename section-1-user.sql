-- === SECTION 1: Vérifier l'utilisateur connecté ===
SELECT
  '=== UTILISATEUR CONNECTÉ ===' as section,
  auth.uid() as user_id,
  CASE WHEN auth.uid() IS NOT NULL THEN 'AUTHENTIFIÉ' ELSE 'NON AUTHENTIFIÉ' END as status;
