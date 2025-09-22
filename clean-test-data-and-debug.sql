-- Script pour nettoyer les données de test et diagnostiquer les conflits
-- Compatible avec Supabase SQL Editor

SELECT 'NETTOYAGE DONNÉES DE TEST ET DIAGNOSTIC CONFLITS' as titre;
SELECT '===================================================' as separateur;

-- 1. Identifier les données de test suspectes
SELECT 'IDENTIFICATION DONNÉES DE TEST:' as info;

SELECT 'Produits avec des noms de test:' as info;
SELECT product_id, name, description, seller_id, created_at
FROM products 
WHERE UPPER(name) LIKE '%TEST%' 
   OR UPPER(description) LIKE '%TEST%'
   OR LENGTH(description) < 10
   OR product_id LIKE '%TEST%'
ORDER BY created_at DESC;

SELECT 'Variantes avec des SKU de test:' as info;
SELECT sku, product_id, name, seller_id, created_at
FROM product_variants 
WHERE UPPER(sku) LIKE '%TEST%' 
   OR UPPER(name) LIKE '%TEST%'
   OR UPPER(description) LIKE '%TEST%'
   OR LENGTH(description) < 10
ORDER BY created_at DESC;

-- 2. Vérifier les doublons potentiels
SELECT 'VÉRIFICATION DOUBLONS:' as info;

SELECT 'Produits avec des noms similaires:' as info;
SELECT name, COUNT(*) as count, STRING_AGG(product_id, ', ') as product_ids
FROM products 
GROUP BY UPPER(TRIM(name))
HAVING COUNT(*) > 1
ORDER BY count DESC;

SELECT 'Variantes avec des SKU similaires:' as info;
SELECT 
    SUBSTRING(sku, 1, POSITION('-' IN sku || '-') - 1) as base_sku,
    COUNT(*) as count,
    STRING_AGG(sku, ', ') as all_skus
FROM product_variants 
GROUP BY SUBSTRING(sku, 1, POSITION('-' IN sku || '-') - 1)
HAVING COUNT(*) > 3  -- Plus de 3 variantes pour le même produit base
ORDER BY count DESC;

-- 3. Vérifier les contraintes qui pourraient bloquer
SELECT 'VÉRIFICATION CONTRAINTES:' as info;

SELECT 'Contraintes uniques sur products:' as info;
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass
AND contype IN ('u', 'p')  -- unique ou primary key
ORDER BY conname;

SELECT 'Contraintes uniques sur product_variants:' as info;
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'product_variants'::regclass
AND contype IN ('u', 'p')  -- unique ou primary key
ORDER BY conname;

-- 4. Nettoyer les données de test automatiquement
SELECT 'NETTOYAGE AUTOMATIQUE:' as info;

DO $$
DECLARE
    deleted_variants INTEGER := 0;
    deleted_products INTEGER := 0;
BEGIN
    -- Supprimer les variantes de test
    DELETE FROM product_variants 
    WHERE UPPER(sku) LIKE '%TEST%' 
       OR UPPER(name) LIKE '%TEST%'
       OR UPPER(description) LIKE '%TEST%'
       OR LENGTH(COALESCE(description, '')) < 10
       OR product_id LIKE '%TEST%';
    
    GET DIAGNOSTICS deleted_variants = ROW_COUNT;
    
    -- Supprimer les produits de test
    DELETE FROM products 
    WHERE UPPER(name) LIKE '%TEST%' 
       OR UPPER(COALESCE(description, '')) LIKE '%TEST%'
       OR LENGTH(COALESCE(description, '')) < 10
       OR product_id LIKE '%TEST%';
    
    GET DIAGNOSTICS deleted_products = ROW_COUNT;
    
    RAISE NOTICE 'Nettoyage terminé: % variantes supprimées, % produits supprimés', deleted_variants, deleted_products;
END $$;

-- 5. Nettoyer les produits orphelins (sans variantes)
SELECT 'NETTOYAGE PRODUITS ORPHELINS:' as info;

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

-- 6. Vérifier les seller_id problématiques
SELECT 'VÉRIFICATION SELLER_ID:' as info;

SELECT 'Produits avec seller_id invalide:' as info;
SELECT p.product_id, p.name, p.seller_id
FROM products p
LEFT JOIN auth.users u ON p.seller_id = u.id
WHERE p.seller_id IS NOT NULL AND u.id IS NULL
LIMIT 10;

SELECT 'Variantes avec seller_id invalide:' as info;
SELECT pv.sku, pv.name, pv.seller_id
FROM product_variants pv
LEFT JOIN auth.users u ON pv.seller_id = u.id
WHERE pv.seller_id IS NOT NULL AND u.id IS NULL
LIMIT 10;

-- 7. Test d'insertion après nettoyage
SELECT 'TEST INSERTION APRÈS NETTOYAGE:' as info;

DO $$
DECLARE
    test_user_id UUID;
    test_product_id TEXT := 'CLEAN-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
    -- Récupérer un vendeur existant ou créer un utilisateur test
    SELECT id INTO test_user_id 
    FROM profiles 
    WHERE role = 'vendeur' 
    LIMIT 1;
    
    IF test_user_id IS NULL THEN
        -- Créer un utilisateur test si aucun vendeur n'existe
        INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
        VALUES (
            '99999999-9999-9999-9999-999999999999'::uuid,
            'test-clean@example.com',
            NOW(),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO profiles (id, role, display_name, created_at)
        VALUES (
            '99999999-9999-9999-9999-999999999999'::uuid,
            'vendeur',
            'Test Clean Seller',
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'vendeur',
            display_name = 'Test Clean Seller';
        
        test_user_id := '99999999-9999-9999-9999-999999999999'::uuid;
    END IF;
    
    BEGIN
        -- Test produit
        INSERT INTO products (product_id, name, categorie, description, images, seller_id)
        VALUES (
            test_product_id,
            'Nike Air Force 1 Clean Test',
            'Homme',
            'Chaussure de test après nettoyage avec une description correcte et suffisamment longue pour être réaliste',
            'https://example.com/clean-test.jpg',
            test_user_id
        );
        
        -- Test variante
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
            'Test après nettoyage en taille 42 avec description complète',
            test_user_id
        );
        
        RAISE NOTICE 'SUCCESS: Test d''insertion après nettoyage réussi !';
        
        -- Nettoyer ce test
        DELETE FROM product_variants WHERE product_id = test_product_id;
        DELETE FROM products WHERE product_id = test_product_id;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Test après nettoyage échoué - %', SQLERRM;
        -- Nettoyer en cas d'erreur
        DELETE FROM product_variants WHERE product_id = test_product_id;
        DELETE FROM products WHERE product_id = test_product_id;
    END;
END $$;

-- 8. Statistiques finales
SELECT 'STATISTIQUES APRÈS NETTOYAGE:' as info;

SELECT 
    'products' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN UPPER(name) LIKE '%TEST%' THEN 1 END) as remaining_test_data
FROM products
UNION ALL
SELECT 
    'product_variants',
    COUNT(*),
    COUNT(CASE WHEN UPPER(sku) LIKE '%TEST%' THEN 1 END)
FROM product_variants;

-- 9. Recommandations
SELECT 'RECOMMANDATIONS:' as info
UNION ALL
SELECT '==============='
UNION ALL
SELECT 'Après ce nettoyage:'
UNION ALL
SELECT '1. Essayez d''ajouter votre vrai produit'
UNION ALL
SELECT '2. Si ça échoue encore, vérifiez le message d''erreur exact'
UNION ALL
SELECT '3. Assurez-vous que le SKU est unique'
UNION ALL
SELECT '4. Vérifiez que toutes les images sont bien uploadées'
UNION ALL
SELECT '5. Évitez les caractères spéciaux dans les noms de produits';
