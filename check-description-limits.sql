-- Script pour vérifier les limites de caractères du champ description
-- Compatible avec Supabase SQL Editor

SELECT 'VÉRIFICATION LIMITES DESCRIPTION' as titre;
SELECT '===================================' as separateur;

-- 1. Vérifier la structure détaillée des colonnes description
SELECT 'Structure colonne description dans products:' as info;
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    character_octet_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'description';

SELECT 'Structure colonne description dans product_variants:' as info;
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    character_octet_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
AND column_name = 'description';

-- 2. Vérifier s'il y a des contraintes CHECK sur la longueur
SELECT 'Contraintes CHECK sur products:' as info;
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass
AND contype = 'c'
AND pg_get_constraintdef(oid) LIKE '%description%';

SELECT 'Contraintes CHECK sur product_variants:' as info;
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'product_variants'::regclass
AND contype = 'c'
AND pg_get_constraintdef(oid) LIKE '%description%';

-- 3. Analyser les descriptions existantes pour voir les longueurs actuelles
SELECT 'Statistiques descriptions products existantes:' as info;
SELECT 
    COUNT(*) as total_products,
    COUNT(description) as with_description,
    MIN(LENGTH(description)) as min_length,
    MAX(LENGTH(description)) as max_length,
    AVG(LENGTH(description))::integer as avg_length
FROM products
WHERE description IS NOT NULL;

SELECT 'Statistiques descriptions product_variants existantes:' as info;
SELECT 
    COUNT(*) as total_variants,
    COUNT(description) as with_description,
    MIN(LENGTH(description)) as min_length,
    MAX(LENGTH(description)) as max_length,
    AVG(LENGTH(description))::integer as avg_length
FROM product_variants
WHERE description IS NOT NULL;

-- 4. Exemples de descriptions les plus longues
SELECT 'Top 5 descriptions les plus longues (products):' as info;
SELECT 
    product_id,
    name,
    LENGTH(description) as length,
    LEFT(description, 100) || '...' as preview
FROM products 
WHERE description IS NOT NULL
ORDER BY LENGTH(description) DESC
LIMIT 5;

SELECT 'Top 5 descriptions les plus longues (product_variants):' as info;
SELECT 
    sku,
    name,
    LENGTH(description) as length,
    LEFT(description, 100) || '...' as preview
FROM product_variants 
WHERE description IS NOT NULL
ORDER BY LENGTH(description) DESC
LIMIT 5;

-- 5. Test de limite - essayer d'insérer une description très longue
SELECT 'Test limite description:' as info;
DO $$
DECLARE
    long_description TEXT;
    test_result TEXT;
BEGIN
    -- Créer une description de test de différentes tailles
    long_description := REPEAT('A', 1000); -- 1000 caractères
    
    BEGIN
        -- Tester insertion avec 1000 caractères
        INSERT INTO products (product_id, name, categorie, description)
        VALUES ('TEST-DESC-LIMIT', 'Test Description Limit', 'Homme', long_description);
        
        test_result := 'SUCCESS: 1000 caractères acceptés';
        
        -- Nettoyer
        DELETE FROM products WHERE product_id = 'TEST-DESC-LIMIT';
        
    EXCEPTION WHEN OTHERS THEN
        test_result := 'ERROR at 1000 chars: ' || SQLERRM;
    END;
    
    RAISE NOTICE '%', test_result;
    
    -- Test avec 5000 caractères
    long_description := REPEAT('B', 5000);
    
    BEGIN
        INSERT INTO products (product_id, name, categorie, description)
        VALUES ('TEST-DESC-LIMIT-2', 'Test Description Limit 2', 'Homme', long_description);
        
        RAISE NOTICE 'SUCCESS: 5000 caractères acceptés';
        
        -- Nettoyer
        DELETE FROM products WHERE product_id = 'TEST-DESC-LIMIT-2';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR at 5000 chars: %', SQLERRM;
    END;
    
    -- Test avec 10000 caractères
    long_description := REPEAT('C', 10000);
    
    BEGIN
        INSERT INTO products (product_id, name, categorie, description)
        VALUES ('TEST-DESC-LIMIT-3', 'Test Description Limit 3', 'Homme', long_description);
        
        RAISE NOTICE 'SUCCESS: 10000 caractères acceptés';
        
        -- Nettoyer
        DELETE FROM products WHERE product_id = 'TEST-DESC-LIMIT-3';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR at 10000 chars: %', SQLERRM;
    END;
END $$;

-- 6. Résumé et recommandations
SELECT 'RÉSUMÉ:' as info
UNION ALL
SELECT '======='
UNION ALL
SELECT 'Vérifiez les résultats ci-dessus pour connaître:'
UNION ALL
SELECT '- La limite exacte de caractères (character_maximum_length)'
UNION ALL
SELECT '- Les longueurs actuelles utilisées'
UNION ALL
SELECT '- Les résultats des tests de limite'
UNION ALL
SELECT ''
UNION ALL
SELECT 'Si aucune limite n''apparaît, le champ est probablement de type TEXT (illimité)';
