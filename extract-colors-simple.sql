-- =====================================================
-- EXTRAIRE LES COULEURS INDIVIDUELLES - VERSION SIMPLE
-- =====================================================

-- 1. Voir toutes les couleurs composées actuelles
SELECT DISTINCT couleur, COUNT(*) as count
FROM product_variants 
WHERE couleur IS NOT NULL 
AND couleur != ''
AND stock > 0
GROUP BY couleur
ORDER BY count DESC;

-- 2. Extraire toutes les couleurs individuelles
SELECT 
  TRIM(unnest(string_to_array(couleur, ' / '))) as couleur_individuelle,
  COUNT(*) as count_occurrences
FROM product_variants 
WHERE couleur IS NOT NULL 
AND couleur != ''
AND stock > 0
GROUP BY TRIM(unnest(string_to_array(couleur, ' / ')))
ORDER BY count_occurrences DESC;

-- 3. Test de la logique de filtrage
-- Exemple: chercher tous les produits qui contiennent "NOIR" dans leur couleur
SELECT 
  name,
  couleur,
  stock,
  prix_eur
FROM product_variants 
WHERE couleur ILIKE '%NOIR%'
AND stock > 0
LIMIT 10;


