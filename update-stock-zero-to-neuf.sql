-- Script pour changer l'état des produits avec stock = 0 vers "NEUF"
-- Compatible avec Supabase SQL Editor

SELECT 'MISE À JOUR ÉTAT PRODUITS STOCK ZÉRO' as titre;
SELECT '======================================' as separateur;

-- 1. Vérifier combien de produits seront affectés
SELECT 'Produits avec stock = 0 AVANT modification:' as info;
SELECT 
    COUNT(*) as total_produits_stock_zero,
    COUNT(CASE WHEN etat = 'NEUF' THEN 1 END) as deja_neuf,
    COUNT(CASE WHEN etat = 'SECONDE_MAIN' THEN 1 END) as seconde_main,
    COUNT(CASE WHEN etat IS NULL THEN 1 END) as etat_null
FROM product_variants 
WHERE stock = 0;

-- 2. Afficher quelques exemples avant modification
SELECT 'Exemples de produits qui seront modifiés (10 premiers):' as info;
SELECT sku, name, etat, stock, taille
FROM product_variants 
WHERE stock = 0 AND etat != 'NEUF'
LIMIT 10;

-- 3. Effectuer la mise à jour
UPDATE product_variants 
SET etat = 'NEUF'
WHERE stock = 0;

-- 4. Vérifier le résultat
SELECT 'Résultat de la mise à jour:' as info;
SELECT 
    COUNT(*) as total_produits_stock_zero,
    COUNT(CASE WHEN etat = 'NEUF' THEN 1 END) as maintenant_neuf,
    COUNT(CASE WHEN etat = 'SECONDE_MAIN' THEN 1 END) as encore_seconde_main
FROM product_variants 
WHERE stock = 0;

-- 5. Statistiques générales après modification
SELECT 'Statistiques générales après modification:' as info;
SELECT 
    'product_variants' as table_name,
    COUNT(*) as total_produits,
    COUNT(CASE WHEN etat = 'NEUF' THEN 1 END) as total_neuf,
    COUNT(CASE WHEN etat = 'SECONDE_MAIN' THEN 1 END) as total_seconde_main,
    COUNT(CASE WHEN stock = 0 THEN 1 END) as total_stock_zero
FROM product_variants;

SELECT 'MODIFICATION TERMINÉE !' as status;
