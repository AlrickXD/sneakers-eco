-- =====================================================
-- MISE À JOUR SÉCURISÉE : PRODUITS EN STOCK SEULEMENT
-- =====================================================

-- 1. ANALYSE : Voir ce qui va être modifié
SELECT
  'PRODUITS EN STOCK UNIQUEMENT' as operation,
  COUNT(*) as total_a_modifier,
  COUNT(CASE WHEN etat = 'NEUF' THEN 1 END) as deja_neuf,
  COUNT(CASE WHEN etat = 'SECONDE_MAIN' THEN 1 END) as seconde_main
FROM product_variants
WHERE stock > 0;

-- 2. MISE À JOUR : Seulement les produits en stock
UPDATE product_variants
SET etat = 'NEUF'
WHERE stock > 0
  AND etat IS NOT NULL;

-- 3. VÉRIFICATION : Résultat après mise à jour
SELECT
  'APRÈS MISE À JOUR' as status,
  etat,
  COUNT(*) as count,
  COUNT(CASE WHEN stock > 0 THEN 1 END) as in_stock_count
FROM product_variants
GROUP BY etat;

-- =====================================================
-- VERSION ALTERNATIVE : TOUS LES PRODUITS (y compris rupture stock)
-- =====================================================

-- Si vous voulez mettre à jour TOUS les produits (même en rupture) :
-- UPDATE product_variants SET etat = 'NEUF' WHERE etat IS NOT NULL;

-- =====================================================
-- NOTES :
-- - Version SÉCURISÉE : seuls les produits en stock sont modifiés
-- - Les produits en rupture de stock gardent leur état actuel
-- - Exécutez d'abord la requête pour voir, puis modifiez si nécessaire
-- =====================================================
