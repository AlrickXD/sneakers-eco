-- ÉTAPE 1: Analyser la description problématique
-- Exécutez cette section d'abord

SELECT 'ANALYSE DE VOTRE DESCRIPTION PROBLÉMATIQUE' as titre;

-- Votre description originale
WITH problem_description AS (
    SELECT 'On peut toujours compter sur un classique. Color block emblématique. Matières premium. Rembourrage moelleux. La Dunk Low est toujours plus confortable et résistante. Les possibilités sont infinies… Et toi, comment tu vas porter la Dunk ?' as text
)
SELECT 
    text as description_complete,
    LENGTH(text) as longueur_totale,
    CASE WHEN text LIKE '%…%' THEN 'OUI - Points de suspension Unicode détectés' ELSE 'NON' END as points_suspension_unicode,
    CASE WHEN text LIKE '%é%' THEN 'OUI - Accents détectés' ELSE 'NON' END as accents_detectes,
    CASE WHEN text LIKE '%è%' THEN 'OUI - Accents graves détectés' ELSE 'NON' END as accents_graves
FROM problem_description;
