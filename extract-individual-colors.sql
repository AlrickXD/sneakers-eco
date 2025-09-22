-- =====================================================
-- EXTRAIRE LES COULEURS INDIVIDUELLES
-- =====================================================

-- 1. Voir toutes les couleurs composées actuelles
SELECT DISTINCT couleur, COUNT(*) as count
FROM product_variants 
WHERE couleur IS NOT NULL 
AND couleur != ''
AND stock > 0
GROUP BY couleur
ORDER BY count DESC;

-- 2. Extraire toutes les couleurs individuelles (en séparant par " / ")
WITH individual_colors AS (
  SELECT DISTINCT 
    TRIM(unnest(string_to_array(couleur, ' / '))) as couleur_individuelle,
    COUNT(*) OVER (PARTITION BY TRIM(unnest(string_to_array(couleur, ' / ')))) as count_products
  FROM product_variants 
  WHERE couleur IS NOT NULL 
  AND couleur != ''
  AND stock > 0
)
SELECT 
  couleur_individuelle,
  COUNT(*) as count_occurrences
FROM individual_colors
GROUP BY couleur_individuelle
ORDER BY count_occurrences DESC;

-- 3. Générer le code JavaScript pour les couleurs individuelles
SELECT 
  'const availableColors = [' as code,
  0 as sort_order
UNION ALL
SELECT 
  '  ''' || couleur_individuelle || ''',' as code,
  1 as sort_order
FROM (
  SELECT 
    couleur_individuelle,
    COUNT(*) as count_occurrences
  FROM (
    SELECT DISTINCT 
      TRIM(unnest(string_to_array(couleur, ' / '))) as couleur_individuelle
    FROM product_variants 
    WHERE couleur IS NOT NULL 
    AND couleur != ''
    AND stock > 0
  ) individual_colors
  GROUP BY couleur_individuelle
  ORDER BY count_occurrences DESC
) color_counts
UNION ALL
SELECT 
  ']' as code,
  2 as sort_order
ORDER BY sort_order, code;

-- 4. Test de la logique de filtrage
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
