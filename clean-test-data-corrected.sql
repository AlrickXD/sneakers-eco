-- Script de nettoyage corrigé basé sur la vraie structure de votre DB
-- Compatible avec Supabase SQL Editor

SELECT 'NETTOYAGE DONNÉES DE TEST - VERSION CORRIGÉE' as titre;
SELECT '===============================================' as separateur;

-- 1. D'abord, vérifier les colonnes disponibles dans products
SELECT 'Vérification structure products:' as info;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les colonnes disponibles dans product_variants  
SELECT 'Vérification structure product_variants:' as info;
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'product_variants' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Identifier les données de test dans products (sans created_at si elle n'existe pas)
SELECT 'Produits suspects (données de test):' as info;
SELECT 
    product_id, 
    name, 
    COALESCE(description, 'NULL') as description,
    seller_id
FROM products 
WHERE UPPER(COALESCE(name, '')) LIKE '%TEST%' 
   OR UPPER(COALESCE(description, '')) LIKE '%TEST%'
   OR LENGTH(COALESCE(description, '')) < 10
   OR UPPER(product_id) LIKE '%TEST%'
   OR UPPER(product_id) LIKE '%DEBUG%'
   OR UPPER(product_id) LIKE '%CLEAN%'
LIMIT 20;

-- 4. Identifier les données de test dans product_variants
SELECT 'Variantes suspectes (données de test):' as info;
SELECT 
    sku, 
    product_id, 
    name, 
    seller_id
FROM product_variants 
WHERE UPPER(COALESCE(sku, '')) LIKE '%TEST%' 
   OR UPPER(COALESCE(name, '')) LIKE '%TEST%'
   OR UPPER(COALESCE(description, '')) LIKE '%TEST%'
   OR LENGTH(COALESCE(description, '')) < 10
   OR UPPER(product_id) LIKE '%TEST%'
   OR UPPER(product_id) LIKE '%DEBUG%'
   OR UPPER(product_id) LIKE '%CLEAN%'
LIMIT 20;

-- 5. Vérifier les doublons de noms de produits
SELECT 'Doublons potentiels dans products:' as info;
SELECT 
    name, 
    COUNT(*) as count, 
    STRING_AGG(product_id, ', ') as product_ids
FROM products 
GROUP BY UPPER(TRIM(COALESCE(name, '')))
HAVING COUNT(*) > 1
ORDER BY count DESC
LIMIT 10;

-- 6. Nettoyer les données de test - ÉTAPE 1: Variantes
SELECT 'NETTOYAGE - Suppression des variantes de test:' as info;
DO $$
DECLARE
    deleted_variants INTEGER := 0;
BEGIN
    DELETE FROM product_variants 
    WHERE UPPER(COALESCE(sku, '')) LIKE '%TEST%' 
       OR UPPER(COALESCE(name, '')) LIKE '%TEST%'
       OR UPPER(COALESCE(description, '')) LIKE '%TEST%'
       OR LENGTH(COALESCE(description, '')) < 10
       OR UPPER(COALESCE(product_id, '')) LIKE '%TEST%'
       OR UPPER(COALESCE(product_id, '')) LIKE '%DEBUG%'
       OR UPPER(COALESCE(product_id, '')) LIKE '%CLEAN%'
       OR UPPER(COALESCE(sku, '')) LIKE '%DIAGNOSTIC%';
    
    GET DIAGNOSTICS deleted_variants = ROW_COUNT;
    RAISE NOTICE 'Variantes de test supprimées: %', deleted_variants;
END $$;

-- 7. Nettoyer les données de test - ÉTAPE 2: Produits
SELECT 'NETTOYAGE - Suppression des produits de test:' as info;
DO $$
DECLARE
    deleted_products INTEGER := 0;
BEGIN
    DELETE FROM products 
    WHERE UPPER(COALESCE(name, '')) LIKE '%TEST%' 
       OR UPPER(COALESCE(description, '')) LIKE '%TEST%'
       OR LENGTH(COALESCE(description, '')) < 10
       OR UPPER(COALESCE(product_id, '')) LIKE '%TEST%'
       OR UPPER(COALESCE(product_id, '')) LIKE '%DEBUG%'
       OR UPPER(COALESCE(product_id, '')) LIKE '%CLEAN%'
       OR UPPER(COALESCE(product_id, '')) LIKE '%DIAGNOSTIC%';
    
    GET DIAGNOSTICS deleted_products = ROW_COUNT;
    RAISE NOTICE 'Produits de test supprimés: %', deleted_products;
END $$;

-- 8. Nettoyer les produits orphelins (sans variantes)
SELECT 'NETTOYAGE - Suppression des produits orphelins:' as info;
DO $$
DECLARE
    deleted_orphans INTEGER := 0;
BEGIN
    DELETE FROM products 
    WHERE product_id NOT IN (
        SELECT DISTINCT product_id 
        FROM product_variants 
        WHERE product_id IS NOT NULL
    );
    
    GET DIAGNOSTICS deleted_orphans = ROW_COUNT;
    RAISE NOTICE 'Produits orphelins supprimés: %', deleted_orphans;
END $$;

-- 9. Vérifier les seller_id problématiques avec vos vrais utilisateurs
SELECT 'Vérification seller_id:' as info;
SELECT 'Produits avec seller_id invalide:' as info;
SELECT p.product_id, p.name, p.seller_id
FROM products p
LEFT JOIN profiles pr ON p.seller_id = pr.id
WHERE p.seller_id IS NOT NULL AND pr.id IS NULL
LIMIT 10;

-- 10. Test d'insertion avec un de vos vrais utilisateurs vendeur
SELECT 'TEST INSERTION avec vrai vendeur:' as info;
DO $$
DECLARE
    real_seller_id UUID;
    test_product_id TEXT := 'CLEAN-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
    -- Utiliser un de vos vrais vendeurs
    SELECT id INTO real_seller_id 
    FROM profiles 
    WHERE role = 'vendeur' 
    LIMIT 1;
    
    IF real_seller_id IS NOT NULL THEN
        BEGIN
            -- Test produit avec structure réelle
            INSERT INTO products (product_id, name, categorie, description, images, seller_id)
            VALUES (
                test_product_id,
                'Nike Air Force 1 Clean Test',
                'Homme',
                'Chaussure de test après nettoyage avec une description correcte et suffisamment longue pour être réaliste dans le cadre de notre test',
                'https://example.com/clean-test.jpg',
                real_seller_id
            );
            
            -- Test variante avec structure réelle
            INSERT INTO product_variants (
                sku, product_id, name, brand, etat, taille, categorie, 
                prix_eur, stock, images, couleur, description, seller_id
            )
            VALUES (
                test_product_id || '-42-neuf',
                test_product_id,
                'Nike Air Force 1 Clean Test - Taille 42',
                'Nike',
                'NEUF',
                42,
                'Homme',
                129.99,
                5,
                'https://example.com/clean-test.jpg',
                'BLANC',
                'Test après nettoyage en taille 42 avec description complète pour vérifier le bon fonctionnement',
                real_seller_id
            );
            
            RAISE NOTICE 'SUCCESS: Test d''insertion après nettoyage réussi avec vendeur %!', real_seller_id;
            
            -- Nettoyer ce test
            DELETE FROM product_variants WHERE product_id = test_product_id;
            DELETE FROM products WHERE product_id = test_product_id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR: Test après nettoyage échoué - %', SQLERRM;
            -- Nettoyer en cas d'erreur
            DELETE FROM product_variants WHERE product_id = test_product_id;
            DELETE FROM products WHERE product_id = test_product_id;
        END;
    ELSE
        RAISE NOTICE 'ATTENTION: Aucun vendeur trouvé pour le test';
    END IF;
END $$;

-- 11. Statistiques finales
SELECT 'STATISTIQUES FINALES:' as info;
SELECT 
    'products' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN UPPER(COALESCE(name, '')) LIKE '%TEST%' THEN 1 END) as remaining_test_data
FROM products
UNION ALL
SELECT 
    'product_variants',
    COUNT(*),
    COUNT(CASE WHEN UPPER(COALESCE(sku, '')) LIKE '%TEST%' THEN 1 END)
FROM product_variants;

-- 12. Vos utilisateurs vendeurs disponibles
SELECT 'VOS VENDEURS DISPONIBLES:' as info;
SELECT id, display_name, role 
FROM profiles 
WHERE role = 'vendeur'
ORDER BY display_name;

SELECT 'NETTOYAGE TERMINÉ!' as final_status
UNION ALL
SELECT 'Vous pouvez maintenant essayer d''ajouter un vrai produit.'
UNION ALL  
SELECT 'Si ça échoue encore, partagez-moi le message d''erreur exact.';
