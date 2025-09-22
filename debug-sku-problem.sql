-- Script pour diagnostiquer le problème de SKU
-- Exécutez dans Supabase SQL Editor

SELECT 'DIAGNOSTIC PROBLÈME SKU' as titre;
SELECT '========================' as separateur;

-- 1. Vérifier les contraintes sur le SKU dans products
SELECT 'Contraintes sur product_id (SKU) dans products:' as info;
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass
AND pg_get_constraintdef(oid) LIKE '%product_id%'
ORDER BY conname;

-- 2. Vérifier les contraintes sur le SKU dans product_variants
SELECT 'Contraintes sur sku dans product_variants:' as info;
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'product_variants'::regclass
AND pg_get_constraintdef(oid) LIKE '%sku%'
ORDER BY conname;

-- 3. Vérifier les SKU/product_id existants
SELECT 'SKU existants dans products (10 derniers):' as info;
SELECT product_id, name, seller_id
FROM products 
ORDER BY product_id DESC
LIMIT 10;

SELECT 'SKU existants dans product_variants (10 derniers):' as info;
SELECT sku, product_id, name, seller_id
FROM product_variants 
ORDER BY sku DESC
LIMIT 10;

-- 4. Chercher des doublons potentiels
SELECT 'Doublons product_id dans products:' as info;
SELECT product_id, COUNT(*) as count
FROM products 
GROUP BY product_id
HAVING COUNT(*) > 1
ORDER BY count DESC;

SELECT 'Doublons sku dans product_variants:' as info;
SELECT sku, COUNT(*) as count
FROM product_variants 
GROUP BY sku
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 5. Test d'insertion avec différents formats de SKU
DO $$
DECLARE
    test_seller_id UUID;
    base_timestamp TEXT := EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
    -- Récupérer un vendeur
    SELECT id INTO test_seller_id FROM profiles WHERE role = 'vendeur' LIMIT 1;
    
    IF test_seller_id IS NOT NULL THEN
        
        -- TEST 1: SKU simple
        BEGIN
            INSERT INTO products (product_id, name, categorie, seller_id)
            VALUES (
                'TEST-SKU-1-' || base_timestamp,
                'Test SKU Simple',
                'Homme',
                test_seller_id
            );
            RAISE NOTICE 'SUCCESS: SKU simple fonctionne';
            DELETE FROM products WHERE product_id = 'TEST-SKU-1-' || base_timestamp;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR SKU simple: %', SQLERRM;
        END;
        
        -- TEST 2: SKU avec tirets (format Nike)
        BEGIN
            INSERT INTO products (product_id, name, categorie, seller_id)
            VALUES (
                'NIKE-AIR-FORCE-1-' || base_timestamp,
                'Test SKU Nike Format',
                'Homme',
                test_seller_id
            );
            RAISE NOTICE 'SUCCESS: SKU format Nike fonctionne';
            DELETE FROM products WHERE product_id = 'NIKE-AIR-FORCE-1-' || base_timestamp;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR SKU Nike: %', SQLERRM;
        END;
        
        -- TEST 3: SKU avec caractères spéciaux
        BEGIN
            INSERT INTO products (product_id, name, categorie, seller_id)
            VALUES (
                'TEST_SKU@123#' || base_timestamp,
                'Test SKU Caractères Spéciaux',
                'Homme',
                test_seller_id
            );
            RAISE NOTICE 'SUCCESS: SKU avec caractères spéciaux fonctionne';
            DELETE FROM products WHERE product_id = 'TEST_SKU@123#' || base_timestamp;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR SKU caractères spéciaux: %', SQLERRM;
        END;
        
        -- TEST 4: SKU très long
        BEGIN
            INSERT INTO products (product_id, name, categorie, seller_id)
            VALUES (
                'VERY-LONG-SKU-NAME-WITH-MANY-CHARACTERS-AND-DETAILS-' || base_timestamp,
                'Test SKU Très Long',
                'Homme',
                test_seller_id
            );
            RAISE NOTICE 'SUCCESS: SKU très long fonctionne';
            DELETE FROM products WHERE product_id = 'VERY-LONG-SKU-NAME-WITH-MANY-CHARACTERS-AND-DETAILS-' || base_timestamp;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR SKU très long: %', SQLERRM;
        END;
        
    END IF;
END $$;

-- 6. Recommandations
SELECT 'RECOMMANDATIONS:' as info
UNION ALL
SELECT '==============='
UNION ALL
SELECT 'Basé sur les tests ci-dessus:'
UNION ALL
SELECT '1. Vérifiez les messages ERROR pour identifier le format problématique'
UNION ALL
SELECT '2. Si "duplicate key value", le SKU existe déjà'
UNION ALL
SELECT '3. Si "check constraint", il y a une règle de validation'
UNION ALL
SELECT '4. Utilisez des SKU uniques avec timestamp'
UNION ALL
SELECT '5. Format recommandé: MARQUE-MODELE-COULEUR-TIMESTAMP';
