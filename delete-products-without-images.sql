-- =====================================================
-- SCRIPT DE SUPPRESSION DES PRODUITS SANS IMAGES
-- =====================================================
-- Ce script supprime tous les produits et variantes qui n'ont pas d'images
-- ATTENTION: Cette opération est irréversible !
-- =====================================================

-- 1. ÉTAPE DE VÉRIFICATION - Compter les produits à supprimer
-- Exécutez d'abord cette section pour voir combien de produits seront supprimés

DO $$
DECLARE
    products_to_delete INTEGER;
    variants_to_delete INTEGER;
    orders_affected INTEGER;
BEGIN
    -- Compter les produits principaux sans images
    SELECT COUNT(*) INTO products_to_delete
    FROM products 
    WHERE images IS NULL 
       OR images = '' 
       OR TRIM(images) = '';

    -- Compter les variantes sans images
    SELECT COUNT(*) INTO variants_to_delete
    FROM product_variants 
    WHERE images IS NULL 
       OR images = '' 
       OR TRIM(images) = '';

    -- Compter les commandes qui pourraient être affectées
    SELECT COUNT(DISTINCT oi.order_id) INTO orders_affected
    FROM order_items oi
    JOIN product_variants pv ON oi.sku = pv.sku
    WHERE pv.images IS NULL 
       OR pv.images = '' 
       OR TRIM(pv.images) = '';

    -- Afficher les statistiques
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VÉRIFICATION AVANT SUPPRESSION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Produits principaux à supprimer: %', products_to_delete;
    RAISE NOTICE 'Variantes de produits à supprimer: %', variants_to_delete;
    RAISE NOTICE 'Commandes potentiellement affectées: %', orders_affected;
    RAISE NOTICE '========================================';
    
    IF orders_affected > 0 THEN
        RAISE NOTICE '⚠️  ATTENTION: Il y a % commandes qui contiennent des produits sans images !', orders_affected;
        RAISE NOTICE '⚠️  Vérifiez ces commandes avant de continuer.';
    END IF;
END $$;

-- 2. DÉTAIL DES PRODUITS À SUPPRIMER
-- Voir quels produits seront supprimés

RAISE NOTICE '========================================';
RAISE NOTICE 'DÉTAIL DES PRODUITS À SUPPRIMER';
RAISE NOTICE '========================================';

-- Produits principaux sans images
SELECT 
    'PRODUIT PRINCIPAL' as type,
    product_id,
    name,
    categorie,
    COALESCE(images, 'NULL') as images_status
FROM products 
WHERE images IS NULL 
   OR images = '' 
   OR TRIM(images) = ''
ORDER BY product_id;

-- Variantes sans images
SELECT 
    'VARIANTE' as type,
    sku,
    product_id,
    name,
    brand,
    prix_eur,
    stock,
    COALESCE(images, 'NULL') as images_status
FROM product_variants 
WHERE images IS NULL 
   OR images = '' 
   OR TRIM(images) = ''
ORDER BY product_id, sku;

-- 3. VÉRIFICATION DES COMMANDES AFFECTÉES
-- Voir les commandes qui contiennent des produits sans images

SELECT DISTINCT
    o.id as order_id,
    o.status as order_status,
    o.total_eur,
    o.created_at,
    pv.sku,
    pv.name as product_name,
    oi.quantity,
    oi.unit_price_eur
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN product_variants pv ON oi.sku = pv.sku
WHERE pv.images IS NULL 
   OR pv.images = '' 
   OR TRIM(pv.images) = ''
ORDER BY o.created_at DESC;

-- =====================================================
-- 4. SCRIPT DE SUPPRESSION (À DÉCOMMENTER POUR EXÉCUTER)
-- =====================================================
-- ⚠️  DÉCOMMENTEZ UNIQUEMENT APRÈS AVOIR VÉRIFIÉ LES RÉSULTATS CI-DESSUS ⚠️

/*
-- Démarrer une transaction pour pouvoir annuler en cas de problème
BEGIN;

-- A) Supprimer les items de commandes liés aux variantes sans images
-- (Obligatoire à cause des contraintes de clés étrangères)
DELETE FROM order_items 
WHERE sku IN (
    SELECT sku 
    FROM product_variants 
    WHERE images IS NULL 
       OR images = '' 
       OR TRIM(images) = ''
);

-- B) Supprimer les variantes de produits sans images
DELETE FROM product_variants 
WHERE images IS NULL 
   OR images = '' 
   OR TRIM(images) = '';

-- C) Supprimer les produits principaux sans images
-- (Uniquement ceux qui n'ont plus de variantes)
DELETE FROM products 
WHERE (images IS NULL OR images = '' OR TRIM(images) = '')
   OR product_id NOT IN (
       SELECT DISTINCT product_id 
       FROM product_variants 
       WHERE product_id IS NOT NULL
   );

-- Afficher le résultat
DO $$
DECLARE
    deleted_items INTEGER;
    deleted_variants INTEGER;
    deleted_products INTEGER;
BEGIN
    GET DIAGNOSTICS deleted_items = ROW_COUNT;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SUPPRESSION TERMINÉE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Items de commandes supprimés: (voir étapes précédentes)';
    RAISE NOTICE 'Variantes supprimées: (voir étapes précédentes)';
    RAISE NOTICE 'Produits principaux supprimés: %', deleted_items;
    RAISE NOTICE '========================================';
END $$;

-- Si tout semble correct, validez la transaction :
-- COMMIT;

-- Si quelque chose ne va pas, annulez la transaction :
-- ROLLBACK;
*/

-- =====================================================
-- INSTRUCTIONS D'UTILISATION :
-- =====================================================
-- 1. Exécutez d'abord les sections 1, 2 et 3 pour vérifier
-- 2. Analysez les résultats attentivement
-- 3. Si vous êtes sûr, décommentez la section 4
-- 4. Exécutez la section 4
-- 5. Vérifiez les résultats avec COMMIT ou ROLLBACK
-- =====================================================
