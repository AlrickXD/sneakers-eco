-- =====================================================
-- SCRIPT DE SUPPRESSION DES PRODUITS AVEC IMAGES CASSÉES
-- =====================================================
-- Ce script supprime les produits et variantes avec des URLs d'images non fonctionnelles
-- ATTENTION: Cette opération est irréversible !
-- =====================================================

-- ÉTAPE 1: DIAGNOSTIC - Identifier les produits problématiques
-- Exécutez d'abord cette section pour voir ce qui sera supprimé

DO $$
DECLARE
    products_no_images INTEGER;
    variants_no_images INTEGER;
    products_broken_urls INTEGER;
    variants_broken_urls INTEGER;
    total_products_to_delete INTEGER;
    total_variants_to_delete INTEGER;
BEGIN
    -- Compter les produits principaux sans images
    SELECT COUNT(*) INTO products_no_images
    FROM products 
    WHERE images IS NULL 
       OR images = '' 
       OR TRIM(images) = '';

    -- Compter les variantes sans images
    SELECT COUNT(*) INTO variants_no_images
    FROM product_variants 
    WHERE images IS NULL 
       OR images = '' 
       OR TRIM(images) = '';

    -- Compter les produits avec URLs cassées connues
    SELECT COUNT(*) INTO products_broken_urls
    FROM products 
    WHERE images LIKE '%assets.adidas.com%'
       OR images LIKE '%converse.com%'
       OR images LIKE '%images.vans.com%'
       OR images LIKE '%404%'
       OR images LIKE '%error%'
       OR images = 'nan'
       OR images = 'null'
       OR images = 'undefined';

    -- Compter les variantes avec URLs cassées connues
    SELECT COUNT(*) INTO variants_broken_urls
    FROM product_variants 
    WHERE images LIKE '%assets.adidas.com%'
       OR images LIKE '%converse.com%'
       OR images LIKE '%images.vans.com%'
       OR images LIKE '%404%'
       OR images LIKE '%error%'
       OR images = 'nan'
       OR images = 'null'
       OR images = 'undefined';

    total_products_to_delete := products_no_images + products_broken_urls;
    total_variants_to_delete := variants_no_images + variants_broken_urls;

    RAISE NOTICE '=== DIAGNOSTIC DES IMAGES CASSÉES ===';
    RAISE NOTICE 'Produits sans images: %', products_no_images;
    RAISE NOTICE 'Produits avec URLs cassées: %', products_broken_urls;
    RAISE NOTICE 'TOTAL PRODUITS À SUPPRIMER: %', total_products_to_delete;
    RAISE NOTICE '';
    RAISE NOTICE 'Variantes sans images: %', variants_no_images;
    RAISE NOTICE 'Variantes avec URLs cassées: %', variants_broken_urls;
    RAISE NOTICE 'TOTAL VARIANTES À SUPPRIMER: %', total_variants_to_delete;
    RAISE NOTICE '';
    RAISE NOTICE 'Si ces chiffres vous conviennent, exécutez la section SUPPRESSION ci-dessous.';
END $$;

-- =====================================================
-- ÉTAPE 2: SUPPRESSION EFFECTIVE
-- =====================================================
-- DÉCOMMENTEZ ET EXÉCUTEZ CETTE SECTION POUR SUPPRIMER DÉFINITIVEMENT
-- =====================================================

/*
DO $$
DECLARE
    deleted_variants INTEGER;
    deleted_products INTEGER;
    deleted_orders INTEGER;
BEGIN
    -- 1. Supprimer les éléments des commandes liées aux variantes à supprimer
    DELETE FROM order_items 
    WHERE variant_sku IN (
        SELECT sku FROM product_variants 
        WHERE images IS NULL 
           OR images = '' 
           OR TRIM(images) = ''
           OR images LIKE '%assets.adidas.com%'
           OR images LIKE '%converse.com%'
           OR images LIKE '%images.vans.com%'
           OR images LIKE '%404%'
           OR images LIKE '%error%'
           OR images = 'nan'
           OR images = 'null'
           OR images = 'undefined'
    );
    
    GET DIAGNOSTICS deleted_orders = ROW_COUNT;
    RAISE NOTICE 'Éléments de commande supprimés: %', deleted_orders;

    -- 2. Supprimer les variantes avec images cassées ou manquantes
    DELETE FROM product_variants 
    WHERE images IS NULL 
       OR images = '' 
       OR TRIM(images) = ''
       OR images LIKE '%assets.adidas.com%'
       OR images LIKE '%converse.com%'
       OR images LIKE '%images.vans.com%'
       OR images LIKE '%404%'
       OR images LIKE '%error%'
       OR images = 'nan'
       OR images = 'null'
       OR images = 'undefined';
    
    GET DIAGNOSTICS deleted_variants = ROW_COUNT;
    RAISE NOTICE 'Variantes supprimées: %', deleted_variants;

    -- 3. Supprimer les produits principaux avec images cassées ou manquantes
    DELETE FROM products 
    WHERE images IS NULL 
       OR images = '' 
       OR TRIM(images) = ''
       OR images LIKE '%assets.adidas.com%'
       OR images LIKE '%converse.com%'
       OR images LIKE '%images.vans.com%'
       OR images LIKE '%404%'
       OR images LIKE '%error%'
       OR images = 'nan'
       OR images = 'null'
       OR images = 'undefined';
    
    GET DIAGNOSTICS deleted_products = ROW_COUNT;
    RAISE NOTICE 'Produits principaux supprimés: %', deleted_products;

    -- 4. Supprimer les produits qui n'ont plus de variantes
    DELETE FROM products 
    WHERE product_id NOT IN (
        SELECT DISTINCT product_id FROM product_variants
    );
    
    GET DIAGNOSTICS deleted_products = ROW_COUNT;
    RAISE NOTICE 'Produits orphelins supprimés: %', deleted_products;

    RAISE NOTICE '=== NETTOYAGE TERMINÉ ===';
    RAISE NOTICE 'Total supprimé:';
    RAISE NOTICE '- Éléments de commande: %', deleted_orders;
    RAISE NOTICE '- Variantes: %', deleted_variants;
    RAISE NOTICE '- Produits: %', deleted_products;
END $$;
*/

-- =====================================================
-- ÉTAPE 3: VÉRIFICATION POST-SUPPRESSION
-- =====================================================
-- Exécutez cette section après la suppression pour vérifier

/*
DO $$
DECLARE
    remaining_products INTEGER;
    remaining_variants INTEGER;
    products_with_images INTEGER;
    variants_with_images INTEGER;
BEGIN
    -- Compter ce qui reste
    SELECT COUNT(*) INTO remaining_products FROM products;
    SELECT COUNT(*) INTO remaining_variants FROM product_variants;
    
    -- Compter ceux avec des images valides
    SELECT COUNT(*) INTO products_with_images 
    FROM products 
    WHERE images IS NOT NULL 
      AND images != '' 
      AND TRIM(images) != ''
      AND images NOT LIKE '%assets.adidas.com%'
      AND images NOT LIKE '%converse.com%'
      AND images NOT LIKE '%images.vans.com%';
    
    SELECT COUNT(*) INTO variants_with_images 
    FROM product_variants 
    WHERE images IS NOT NULL 
      AND images != '' 
      AND TRIM(images) != ''
      AND images NOT LIKE '%assets.adidas.com%'
      AND images NOT LIKE '%converse.com%'
      AND images NOT LIKE '%images.vans.com%';

    RAISE NOTICE '=== ÉTAT POST-NETTOYAGE ===';
    RAISE NOTICE 'Produits restants: % (dont % avec images valides)', remaining_products, products_with_images;
    RAISE NOTICE 'Variantes restantes: % (dont % avec images valides)', remaining_variants, variants_with_images;
    
    IF products_with_images = remaining_products AND variants_with_images = remaining_variants THEN
        RAISE NOTICE '✅ SUCCÈS: Tous les produits restants ont des images valides !';
    ELSE
        RAISE NOTICE '⚠️  ATTENTION: Il reste des produits sans images valides.';
    END IF;
END $$;
*/

-- =====================================================
-- REQUÊTES UTILES POUR DIAGNOSTIC MANUEL
-- =====================================================

-- Voir les produits avec URLs cassées d'Adidas
-- SELECT product_id, name, images FROM products WHERE images LIKE '%assets.adidas.com%' LIMIT 10;

-- Voir les variantes avec URLs cassées de Converse  
-- SELECT sku, name, images FROM product_variants WHERE images LIKE '%converse.com%' LIMIT 10;

-- Voir les produits sans images
-- SELECT product_id, name, categorie FROM products WHERE images IS NULL OR images = '' LIMIT 10;

-- Compter par catégorie les produits problématiques
-- SELECT categorie, COUNT(*) as count FROM products 
-- WHERE images IS NULL OR images = '' OR images LIKE '%404%'
-- GROUP BY categorie ORDER BY count DESC;


