-- Script de nettoyage final basé sur votre vraie structure DB
-- Compatible avec Supabase SQL Editor

SELECT 'NETTOYAGE DONNÉES DE TEST - STRUCTURE RÉELLE' as titre;
SELECT '===============================================' as separateur;

-- STRUCTURE CONFIRMÉE:
-- products: product_id, name, categorie, images, description, seller_id, brand, couleur
-- product_variants: sku, product_id, name, etat, taille, categorie, prix_eur, stock, images, description, seller_id, brand, couleur

-- 1. Identifier les données de test dans products
SELECT 'PRODUITS DE TEST IDENTIFIÉS:' as info;
SELECT 
    product_id, 
    name, 
    COALESCE(description, '[NULL]') as description,
    seller_id,
    brand,
    couleur
FROM products 
WHERE UPPER(COALESCE(name, '')) LIKE '%TEST%' 
   OR UPPER(COALESCE(description, '')) LIKE '%TEST%'
   OR LENGTH(COALESCE(description, '')) < 15  -- Descriptions trop courtes
   OR UPPER(product_id) LIKE '%TEST%'
   OR UPPER(product_id) LIKE '%DEBUG%'
   OR UPPER(product_id) LIKE '%CLEAN%'
   OR UPPER(COALESCE(brand, '')) LIKE '%TEST%'
   OR name = 'Test'
   OR name = 'test'
   OR description = 'test'
   OR LENGTH(COALESCE(name, '')) < 5  -- Noms trop courts
ORDER BY product_id;

-- 2. Identifier les données de test dans product_variants
SELECT 'VARIANTES DE TEST IDENTIFIÉES:' as info;
SELECT 
    sku, 
    product_id, 
    name, 
    etat,
    taille,
    prix_eur,
    seller_id,
    brand
FROM product_variants 
WHERE UPPER(COALESCE(sku, '')) LIKE '%TEST%' 
   OR UPPER(COALESCE(name, '')) LIKE '%TEST%'
   OR UPPER(COALESCE(description, '')) LIKE '%TEST%'
   OR LENGTH(COALESCE(description, '')) < 15
   OR UPPER(product_id) LIKE '%TEST%'
   OR UPPER(product_id) LIKE '%DEBUG%'
   OR UPPER(product_id) LIKE '%CLEAN%'
   OR UPPER(COALESCE(brand, '')) LIKE '%TEST%'
   OR prix_eur = 0  -- Prix à zéro suspect
   OR prix_eur = 1  -- Prix à 1 euro suspect
ORDER BY sku;

-- 3. Vérifier les produits avec des données incohérentes
SELECT 'PRODUITS AVEC DONNÉES SUSPECTES:' as info;
SELECT 
    product_id,
    name,
    brand,
    couleur,
    CASE 
        WHEN LENGTH(COALESCE(name, '')) < 5 THEN 'Nom trop court'
        WHEN LENGTH(COALESCE(description, '')) < 15 AND description IS NOT NULL THEN 'Description trop courte'
        WHEN brand IS NULL THEN 'Pas de marque'
        WHEN couleur IS NULL THEN 'Pas de couleur'
        ELSE 'Autre'
    END as probleme
FROM products 
WHERE LENGTH(COALESCE(name, '')) < 5
   OR (LENGTH(COALESCE(description, '')) < 15 AND description IS NOT NULL)
   OR (brand IS NULL AND name NOT LIKE '%Test%')  -- Exclure les tests évidents
ORDER BY probleme, product_id;

-- 4. NETTOYAGE - ÉTAPE 1: Supprimer les variantes de test
SELECT 'SUPPRESSION DES VARIANTES DE TEST:' as info;
DO $$
DECLARE
    deleted_variants INTEGER := 0;
BEGIN
    DELETE FROM product_variants 
    WHERE UPPER(COALESCE(sku, '')) LIKE '%TEST%' 
       OR UPPER(COALESCE(name, '')) LIKE '%TEST%'
       OR UPPER(COALESCE(description, '')) LIKE '%TEST%'
       OR LENGTH(COALESCE(description, '')) < 15
       OR UPPER(COALESCE(product_id, '')) LIKE '%TEST%'
       OR UPPER(COALESCE(product_id, '')) LIKE '%DEBUG%'
       OR UPPER(COALESCE(product_id, '')) LIKE '%CLEAN%'
       OR UPPER(COALESCE(product_id, '')) LIKE '%DIAGNOSTIC%'
       OR UPPER(COALESCE(brand, '')) LIKE '%TEST%'
       OR prix_eur = 0
       OR prix_eur = 1
       OR (LENGTH(COALESCE(name, '')) < 10 AND name NOT LIKE '%-%')  -- Noms courts non-formatés
       OR name = 'test'
       OR name = 'Test';
    
    GET DIAGNOSTICS deleted_variants = ROW_COUNT;
    RAISE NOTICE 'Variantes de test supprimées: %', deleted_variants;
END $$;

-- 5. NETTOYAGE - ÉTAPE 2: Supprimer les produits de test
SELECT 'SUPPRESSION DES PRODUITS DE TEST:' as info;
DO $$
DECLARE
    deleted_products INTEGER := 0;
BEGIN
    DELETE FROM products 
    WHERE UPPER(COALESCE(name, '')) LIKE '%TEST%' 
       OR UPPER(COALESCE(description, '')) LIKE '%TEST%'
       OR LENGTH(COALESCE(description, '')) < 15
       OR UPPER(COALESCE(product_id, '')) LIKE '%TEST%'
       OR UPPER(COALESCE(product_id, '')) LIKE '%DEBUG%'
       OR UPPER(COALESCE(product_id, '')) LIKE '%CLEAN%'
       OR UPPER(COALESCE(product_id, '')) LIKE '%DIAGNOSTIC%'
       OR UPPER(COALESCE(brand, '')) LIKE '%TEST%'
       OR LENGTH(COALESCE(name, '')) < 5
       OR name = 'test'
       OR name = 'Test'
       OR description = 'test';
    
    GET DIAGNOSTICS deleted_products = ROW_COUNT;
    RAISE NOTICE 'Produits de test supprimés: %', deleted_products;
END $$;

-- 6. NETTOYAGE - ÉTAPE 3: Supprimer les produits orphelins
SELECT 'SUPPRESSION DES PRODUITS ORPHELINS:' as info;
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

-- 7. Vérifier les seller_id invalides
SELECT 'VÉRIFICATION SELLER_ID:' as info;
SELECT 'Produits avec seller_id invalide:' as detail;
SELECT p.product_id, p.name, p.seller_id::text as seller_id_text
FROM products p
LEFT JOIN profiles pr ON p.seller_id = pr.id
WHERE p.seller_id IS NOT NULL AND pr.id IS NULL
LIMIT 5;

SELECT 'Variantes avec seller_id invalide:' as detail;
SELECT pv.sku, pv.name, pv.seller_id::text as seller_id_text
FROM product_variants pv
LEFT JOIN profiles pr ON pv.seller_id = pr.id
WHERE pv.seller_id IS NOT NULL AND pr.id IS NULL
LIMIT 5;

-- 8. TEST D'INSERTION avec votre structure exacte
SELECT 'TEST INSERTION AVEC STRUCTURE RÉELLE:' as info;
DO $$
DECLARE
    real_seller_id UUID;
    test_product_id TEXT := 'FINAL-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
    -- Utiliser votre vendeur "alrickadote"
    SELECT id INTO real_seller_id 
    FROM profiles 
    WHERE display_name = 'alrickadote' AND role = 'vendeur';
    
    IF real_seller_id IS NULL THEN
        -- Fallback sur n'importe quel vendeur
        SELECT id INTO real_seller_id 
        FROM profiles 
        WHERE role = 'vendeur' 
        LIMIT 1;
    END IF;
    
    IF real_seller_id IS NOT NULL THEN
        BEGIN
            -- Test produit avec VOTRE structure exacte
            INSERT INTO products (product_id, name, categorie, images, description, seller_id, brand, couleur)
            VALUES (
                test_product_id,
                'Nike Air Force 1 Test Final',
                'Homme',
                'https://example.com/final-test.jpg',
                'Description complète et réaliste pour ce test final de fonctionnement après nettoyage de la base de données',
                real_seller_id,
                'Nike',
                'BLANC'
            );
            
            -- Test variante avec VOTRE structure exacte
            INSERT INTO product_variants (
                sku, product_id, name, etat, taille, categorie, 
                prix_eur, stock, images, description, seller_id, brand, couleur
            )
            VALUES (
                test_product_id || '-42-NEUF',
                test_product_id,
                'Nike Air Force 1 Test Final - Taille 42',
                'NEUF',
                42,
                'Homme',
                129.99,
                5,
                'https://example.com/final-test.jpg',
                'Variante de test final en taille 42 pour vérifier le bon fonctionnement complet',
                real_seller_id,
                'Nike',
                'BLANC'
            );
            
            RAISE NOTICE 'SUCCESS: Test final réussi avec le vendeur %!', real_seller_id;
            
            -- Nettoyer immédiatement
            DELETE FROM product_variants WHERE product_id = test_product_id;
            DELETE FROM products WHERE product_id = test_product_id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR: Test final échoué - %', SQLERRM;
            -- Nettoyer en cas d'erreur
            DELETE FROM product_variants WHERE product_id = test_product_id;
            DELETE FROM products WHERE product_id = test_product_id;
        END;
    ELSE
        RAISE NOTICE 'ATTENTION: Aucun vendeur trouvé pour le test';
    END IF;
END $$;

-- 9. Statistiques finales après nettoyage
SELECT 'STATISTIQUES APRÈS NETTOYAGE:' as info;
SELECT 
    'products' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN UPPER(COALESCE(name, '')) LIKE '%TEST%' THEN 1 END) as remaining_test_data,
    COUNT(CASE WHEN seller_id IS NULL THEN 1 END) as without_seller,
    COUNT(CASE WHEN brand IS NULL THEN 1 END) as without_brand
FROM products
UNION ALL
SELECT 
    'product_variants',
    COUNT(*),
    COUNT(CASE WHEN UPPER(COALESCE(sku, '')) LIKE '%TEST%' THEN 1 END),
    COUNT(CASE WHEN seller_id IS NULL THEN 1 END),
    COUNT(CASE WHEN brand IS NULL THEN 1 END)
FROM product_variants;

-- 10. Vos vendeurs disponibles
SELECT 'VOS VENDEURS DISPONIBLES:' as info;
SELECT id::text as vendeur_id, display_name, role 
FROM profiles 
WHERE role = 'vendeur'
ORDER BY display_name;

-- 11. Résumé final
SELECT 'RÉSUMÉ FINAL:' as info
UNION ALL
SELECT '============'
UNION ALL
SELECT 'Le nettoyage est terminé avec votre structure exacte:'
UNION ALL
SELECT '- products: product_id, name, categorie, images, description, seller_id, brand, couleur'
UNION ALL
SELECT '- product_variants: sku, product_id, name, etat, taille, categorie, prix_eur, stock, images, description, seller_id, brand, couleur'
UNION ALL
SELECT ''
UNION ALL
SELECT 'Vous pouvez maintenant essayer d''ajouter un vrai produit.'
UNION ALL
SELECT 'Si ça échoue, partagez le message d''erreur exact de la console.';
