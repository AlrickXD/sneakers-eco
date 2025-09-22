-- =====================================================
-- SCRIPT DE SUPPRESSION DES CATÉGORIES LIFESTYLE ET SKATEBOARD
-- =====================================================
-- Ce script supprime tous les produits avec les catégories "Lifestyle" et "Skateboard"
-- ATTENTION: Cette opération est irréversible !
-- =====================================================

-- ÉTAPE 1: DIAGNOSTIC - Compter les produits à supprimer
-- Exécutez d'abord cette section pour voir ce qui sera supprimé

DO $$
DECLARE
    products_lifestyle INTEGER;
    products_skateboard INTEGER;
    variants_lifestyle INTEGER;
    variants_skateboard INTEGER;
    total_products_to_delete INTEGER;
    total_variants_to_delete INTEGER;
    orders_affected INTEGER;
BEGIN
    -- Compter les produits principaux avec catégorie Lifestyle
    SELECT COUNT(*) INTO products_lifestyle
    FROM products 
    WHERE LOWER(categorie) = 'lifestyle';

    -- Compter les produits principaux avec catégorie Skateboard
    SELECT COUNT(*) INTO products_skateboard
    FROM products 
    WHERE LOWER(categorie) = 'skateboard';

    -- Compter les variantes avec catégorie Lifestyle
    SELECT COUNT(*) INTO variants_lifestyle
    FROM product_variants 
    WHERE LOWER(categorie) = 'lifestyle';

    -- Compter les variantes avec catégorie Skateboard
    SELECT COUNT(*) INTO variants_skateboard
    FROM product_variants 
    WHERE LOWER(categorie) = 'skateboard';

    -- Compter les commandes affectées
    SELECT COUNT(DISTINCT oi.order_id) INTO orders_affected
    FROM order_items oi
    JOIN product_variants pv ON oi.variant_sku = pv.sku
    WHERE LOWER(pv.categorie) IN ('lifestyle', 'skateboard');

    total_products_to_delete := products_lifestyle + products_skateboard;
    total_variants_to_delete := variants_lifestyle + variants_skateboard;

    RAISE NOTICE '=== DIAGNOSTIC CATÉGORIES LIFESTYLE ET SKATEBOARD ===';
    RAISE NOTICE 'Produits Lifestyle: %', products_lifestyle;
    RAISE NOTICE 'Produits Skateboard: %', products_skateboard;
    RAISE NOTICE 'TOTAL PRODUITS À SUPPRIMER: %', total_products_to_delete;
    RAISE NOTICE '';
    RAISE NOTICE 'Variantes Lifestyle: %', variants_lifestyle;
    RAISE NOTICE 'Variantes Skateboard: %', variants_skateboard;
    RAISE NOTICE 'TOTAL VARIANTES À SUPPRIMER: %', total_variants_to_delete;
    RAISE NOTICE '';
    RAISE NOTICE 'Commandes affectées: %', orders_affected;
    RAISE NOTICE '';
    RAISE NOTICE 'Si ces chiffres vous conviennent, décommentez et exécutez la section SUPPRESSION.';
END $$;

-- =====================================================
-- AFFICHAGE DES PRODUITS CONCERNÉS (pour vérification)
-- =====================================================

-- Voir les produits Lifestyle qui seront supprimés
SELECT 'PRODUITS LIFESTYLE' as type, product_id, name, categorie, images 
FROM products 
WHERE LOWER(categorie) = 'lifestyle'
LIMIT 10;

-- Voir les produits Skateboard qui seront supprimés
SELECT 'PRODUITS SKATEBOARD' as type, product_id, name, categorie, images 
FROM products 
WHERE LOWER(categorie) = 'skateboard'
LIMIT 10;

-- Voir les variantes Lifestyle qui seront supprimées
SELECT 'VARIANTES LIFESTYLE' as type, sku, name, categorie, images 
FROM product_variants 
WHERE LOWER(categorie) = 'lifestyle'
LIMIT 10;

-- Voir les variantes Skateboard qui seront supprimées
SELECT 'VARIANTES SKATEBOARD' as type, sku, name, categorie, images 
FROM product_variants 
WHERE LOWER(categorie) = 'skateboard'
LIMIT 10;

-- =====================================================
-- ÉTAPE 2: SUPPRESSION EFFECTIVE
-- =====================================================
-- DÉCOMMENTEZ ET EXÉCUTEZ CETTE SECTION POUR SUPPRIMER DÉFINITIVEMENT
-- =====================================================

/*
DO $$
DECLARE
    deleted_order_items INTEGER;
    deleted_variants INTEGER;
    deleted_products INTEGER;
    deleted_orphan_products INTEGER;
BEGIN
    RAISE NOTICE 'DÉBUT DE LA SUPPRESSION DES CATÉGORIES LIFESTYLE ET SKATEBOARD...';
    
    -- 1. Supprimer les éléments des commandes liées aux variantes Lifestyle et Skateboard
    DELETE FROM order_items 
    WHERE variant_sku IN (
        SELECT sku FROM product_variants 
        WHERE LOWER(categorie) IN ('lifestyle', 'skateboard')
    );
    
    GET DIAGNOSTICS deleted_order_items = ROW_COUNT;
    RAISE NOTICE '✓ Éléments de commande supprimés: %', deleted_order_items;

    -- 2. Supprimer les variantes avec catégorie Lifestyle ou Skateboard
    DELETE FROM product_variants 
    WHERE LOWER(categorie) IN ('lifestyle', 'skateboard');
    
    GET DIAGNOSTICS deleted_variants = ROW_COUNT;
    RAISE NOTICE '✓ Variantes supprimées: %', deleted_variants;

    -- 3. Supprimer les produits principaux avec catégorie Lifestyle ou Skateboard
    DELETE FROM products 
    WHERE LOWER(categorie) IN ('lifestyle', 'skateboard');
    
    GET DIAGNOSTICS deleted_products = ROW_COUNT;
    RAISE NOTICE '✓ Produits principaux supprimés: %', deleted_products;

    -- 4. Supprimer les produits qui n'ont plus de variantes (nettoyage des orphelins)
    DELETE FROM products 
    WHERE product_id NOT IN (
        SELECT DISTINCT product_id FROM product_variants WHERE product_id IS NOT NULL
    );
    
    GET DIAGNOSTICS deleted_orphan_products = ROW_COUNT;
    RAISE NOTICE '✓ Produits orphelins supprimés: %', deleted_orphan_products;

    RAISE NOTICE '';
    RAISE NOTICE '=== SUPPRESSION TERMINÉE ===';
    RAISE NOTICE 'Résumé des suppressions:';
    RAISE NOTICE '- Éléments de commande: %', deleted_order_items;
    RAISE NOTICE '- Variantes: %', deleted_variants;
    RAISE NOTICE '- Produits: %', deleted_products;
    RAISE NOTICE '- Produits orphelins: %', deleted_orphan_products;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Les catégories Lifestyle et Skateboard ont été supprimées !';
END $$;
*/

-- =====================================================
-- ÉTAPE 3: VÉRIFICATION POST-SUPPRESSION
-- =====================================================
-- Exécutez cette section après la suppression pour vérifier

/*
DO $$
DECLARE
    remaining_lifestyle_products INTEGER;
    remaining_skateboard_products INTEGER;
    remaining_lifestyle_variants INTEGER;
    remaining_skateboard_variants INTEGER;
    total_products INTEGER;
    total_variants INTEGER;
BEGIN
    -- Vérifier qu'il ne reste plus de produits Lifestyle/Skateboard
    SELECT COUNT(*) INTO remaining_lifestyle_products FROM products WHERE LOWER(categorie) = 'lifestyle';
    SELECT COUNT(*) INTO remaining_skateboard_products FROM products WHERE LOWER(categorie) = 'skateboard';
    SELECT COUNT(*) INTO remaining_lifestyle_variants FROM product_variants WHERE LOWER(categorie) = 'lifestyle';
    SELECT COUNT(*) INTO remaining_skateboard_variants FROM product_variants WHERE LOWER(categorie) = 'skateboard';
    
    -- Compter le total restant
    SELECT COUNT(*) INTO total_products FROM products;
    SELECT COUNT(*) INTO total_variants FROM product_variants;

    RAISE NOTICE '=== VÉRIFICATION POST-SUPPRESSION ===';
    RAISE NOTICE 'Produits Lifestyle restants: %', remaining_lifestyle_products;
    RAISE NOTICE 'Produits Skateboard restants: %', remaining_skateboard_products;
    RAISE NOTICE 'Variantes Lifestyle restantes: %', remaining_lifestyle_variants;
    RAISE NOTICE 'Variantes Skateboard restantes: %', remaining_skateboard_variants;
    RAISE NOTICE '';
    RAISE NOTICE 'TOTAL PRODUITS RESTANTS: %', total_products;
    RAISE NOTICE 'TOTAL VARIANTES RESTANTES: %', total_variants;
    
    IF (remaining_lifestyle_products = 0 AND remaining_skateboard_products = 0 AND 
        remaining_lifestyle_variants = 0 AND remaining_skateboard_variants = 0) THEN
        RAISE NOTICE '';
        RAISE NOTICE '✅ SUCCÈS: Toutes les catégories Lifestyle et Skateboard ont été supprimées !';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  ATTENTION: Il reste encore des éléments Lifestyle ou Skateboard.';
    END IF;
END $$;
*/

-- =====================================================
-- REQUÊTES UTILES POUR DIAGNOSTIC FINAL
-- =====================================================

-- Vérifier les catégories restantes
-- SELECT categorie, COUNT(*) as count FROM products GROUP BY categorie ORDER BY count DESC;

-- Vérifier les catégories de variantes restantes  
-- SELECT categorie, COUNT(*) as count FROM product_variants GROUP BY categorie ORDER BY count DESC;
