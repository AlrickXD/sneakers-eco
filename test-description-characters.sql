-- Script pour tester les caractères problématiques dans les descriptions
-- Compatible avec Supabase SQL Editor

SELECT 'TEST DES CARACTÈRES DANS LES DESCRIPTIONS' as titre;
SELECT '===========================================' as separateur;

-- 1. Analyser la description problématique caractère par caractère
WITH problem_description AS (
    SELECT 'On peut toujours compter sur un classique. Color block emblématique. Matières premium. Rembourrage moelleux. La Dunk Low est toujours plus confortable et résistante. Les possibilités sont infinies… Et toi, comment tu vas porter la Dunk ?' as text
)
SELECT 'ANALYSE CARACTÈRE PAR CARACTÈRE:' as info;

-- 2. Identifier les caractères spéciaux
WITH problem_description AS (
    SELECT 'On peut toujours compter sur un classique. Color block emblématique. Matières premium. Rembourrage moelleux. La Dunk Low est toujours plus confortable et résistante. Les possibilités sont infinies… Et toi, comment tu vas porter la Dunk ?' as text
)
SELECT 
    'Caractères spéciaux détectés:' as info,
    CASE 
        WHEN text LIKE '%…%' THEN 'Points de suspension Unicode (…)'
        ELSE 'Pas de points de suspension'
    END as points_suspension,
    CASE 
        WHEN text LIKE '%é%' THEN 'Caractères accentués (é)'
        ELSE 'Pas d''accents'
    END as accents,
    CASE 
        WHEN text LIKE '%?%' THEN 'Point d''interrogation (?)'
        ELSE 'Pas de point d''interrogation'
    END as question_mark,
    LENGTH(text) as longueur_totale
FROM problem_description;

-- 3. Tester différentes versions de la description
DO $$
DECLARE
    test_seller_id UUID;
    base_product_id TEXT := 'DESC-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    counter INTEGER := 1;
BEGIN
    -- Récupérer un vendeur
    SELECT id INTO test_seller_id 
    FROM profiles 
    WHERE role = 'vendeur' 
    LIMIT 1;
    
    IF test_seller_id IS NOT NULL THEN
        
        -- TEST 1: Description simple qui fonctionne
        BEGIN
            INSERT INTO products (product_id, name, categorie, description, seller_id)
            VALUES (
                base_product_id || '-' || counter,
                'Test Description 1',
                'Homme',
                'dfsfs',
                test_seller_id
            );
            RAISE NOTICE 'TEST 1 SUCCESS: Description simple fonctionne';
            DELETE FROM products WHERE product_id = base_product_id || '-' || counter;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'TEST 1 ERROR: %', SQLERRM;
        END;
        counter := counter + 1;
        
        -- TEST 2: Description avec accents uniquement
        BEGIN
            INSERT INTO products (product_id, name, categorie, description, seller_id)
            VALUES (
                base_product_id || '-' || counter,
                'Test Description 2',
                'Homme',
                'Description avec des caractères accentués: été, élégant, qualité',
                test_seller_id
            );
            RAISE NOTICE 'TEST 2 SUCCESS: Accents fonctionnent';
            DELETE FROM products WHERE product_id = base_product_id || '-' || counter;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'TEST 2 ERROR: %', SQLERRM;
        END;
        counter := counter + 1;
        
        -- TEST 3: Description avec apostrophes normales
        BEGIN
            INSERT INTO products (product_id, name, categorie, description, seller_id)
            VALUES (
                base_product_id || '-' || counter,
                'Test Description 3',
                'Homme',
                'On peut toujours compter sur un classique. Et toi, comment tu vas porter la Dunk ?',
                test_seller_id
            );
            RAISE NOTICE 'TEST 3 SUCCESS: Apostrophes normales fonctionnent';
            DELETE FROM products WHERE product_id = base_product_id || '-' || counter;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'TEST 3 ERROR: %', SQLERRM;
        END;
        counter := counter + 1;
        
        -- TEST 4: Description avec points de suspension normaux
        BEGIN
            INSERT INTO products (product_id, name, categorie, description, seller_id)
            VALUES (
                base_product_id || '-' || counter,
                'Test Description 4',
                'Homme',
                'Les possibilités sont infinies... Et toi, comment tu vas porter la Dunk ?',
                test_seller_id
            );
            RAISE NOTICE 'TEST 4 SUCCESS: Points de suspension normaux fonctionnent';
            DELETE FROM products WHERE product_id = base_product_id || '-' || counter;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'TEST 4 ERROR: %', SQLERRM;
        END;
        counter := counter + 1;
        
        -- TEST 5: Description avec caractère Unicode problématique
        BEGIN
            INSERT INTO products (product_id, name, categorie, description, seller_id)
            VALUES (
                base_product_id || '-' || counter,
                'Test Description 5',
                'Homme',
                'Les possibilités sont infinies… Et toi ?',
                test_seller_id
            );
            RAISE NOTICE 'TEST 5 SUCCESS: Points de suspension Unicode fonctionnent';
            DELETE FROM products WHERE product_id = base_product_id || '-' || counter;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'TEST 5 ERROR (UNICODE): %', SQLERRM;
        END;
        counter := counter + 1;
        
        -- TEST 6: Description complète originale
        BEGIN
            INSERT INTO products (product_id, name, categorie, description, seller_id)
            VALUES (
                base_product_id || '-' || counter,
                'Test Description 6',
                'Homme',
                'On peut toujours compter sur un classique. Color block emblématique. Matières premium. Rembourrage moelleux. La Dunk Low est toujours plus confortable et résistante. Les possibilités sont infinies… Et toi, comment tu vas porter la Dunk ?',
                test_seller_id
            );
            RAISE NOTICE 'TEST 6 SUCCESS: Description complète fonctionne';
            DELETE FROM products WHERE product_id = base_product_id || '-' || counter;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'TEST 6 ERROR (DESCRIPTION COMPLÈTE): %', SQLERRM;
        END;
        counter := counter + 1;
        
        -- TEST 7: Version nettoyée de la description
        BEGIN
            INSERT INTO products (product_id, name, categorie, description, seller_id)
            VALUES (
                base_product_id || '-' || counter,
                'Test Description 7',
                'Homme',
                'On peut toujours compter sur un classique. Color block emblematique. Matieres premium. Rembourrage moelleux. La Dunk Low est toujours plus confortable et resistante. Les possibilites sont infinies... Et toi, comment tu vas porter la Dunk ?',
                test_seller_id
            );
            RAISE NOTICE 'TEST 7 SUCCESS: Description nettoyée fonctionne';
            DELETE FROM products WHERE product_id = base_product_id || '-' || counter;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'TEST 7 ERROR (DESCRIPTION NETTOYÉE): %', SQLERRM;
        END;
        
    ELSE
        RAISE NOTICE 'ERREUR: Aucun vendeur trouvé pour les tests';
    END IF;
END $$;

-- 4. Fonction pour nettoyer les descriptions problématiques
CREATE OR REPLACE FUNCTION clean_description(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(input_text, '…', '...'),  -- Remplacer points de suspension Unicode
                ''', ''''),  -- Remplacer apostrophes typographiques
            '"', '"'),  -- Remplacer guillemets typographiques
        '"', '"');  -- Remplacer guillemets typographiques fermants
END;
$$;

-- 5. Tester la fonction de nettoyage
SELECT 'FONCTION DE NETTOYAGE:' as info;
SELECT 
    'Original: On peut toujours compter sur un classique. Les possibilités sont infinies… Et toi ?' as original,
    clean_description('On peut toujours compter sur un classique. Les possibilités sont infinies… Et toi ?') as nettoye;

-- 6. Recommandations
SELECT 'RECOMMANDATIONS:' as info
UNION ALL
SELECT '==============='
UNION ALL
SELECT 'Basé sur les tests ci-dessus:'
UNION ALL
SELECT '1. Si TEST 5 échoue: Le problème vient des points de suspension Unicode (…)'
UNION ALL
SELECT '2. Si TEST 6 échoue: Il y a un autre caractère problématique'
UNION ALL
SELECT '3. Si TEST 7 fonctionne: Utilisez la fonction clean_description()'
UNION ALL
SELECT '4. Vérifiez les messages "ERROR" ci-dessus pour identifier le problème exact';
