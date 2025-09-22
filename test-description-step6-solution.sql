-- ÉTAPE 6: Tester la solution - Description nettoyée
-- Exécutez cette section après l'étape 5

-- Créer une fonction pour nettoyer les descriptions
CREATE OR REPLACE FUNCTION clean_description(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN REPLACE(
        REPLACE(
            REPLACE(input_text, '…', '...'),  -- Remplacer points de suspension Unicode par normaux
            ''', ''''),  -- Remplacer apostrophes typographiques
        '"', '"');  -- Remplacer guillemets typographiques
END;
$$;

-- Tester la description nettoyée
DO $$
DECLARE
    test_seller_id UUID;
    test_product_id TEXT := 'CLEAN-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    clean_desc TEXT;
BEGIN
    SELECT id INTO test_seller_id FROM profiles WHERE role = 'vendeur' LIMIT 1;
    
    -- Nettoyer la description
    clean_desc := clean_description('On peut toujours compter sur un classique. Color block emblématique. Matières premium. Rembourrage moelleux. La Dunk Low est toujours plus confortable et résistante. Les possibilités sont infinies… Et toi, comment tu vas porter la Dunk ?');
    
    RAISE NOTICE 'Description nettoyée: %', clean_desc;
    
    IF test_seller_id IS NOT NULL THEN
        BEGIN
            INSERT INTO products (product_id, name, categorie, description, seller_id)
            VALUES (
                test_product_id,
                'Test Description Nettoyée',
                'Homme',
                clean_desc,
                test_seller_id
            );
            RAISE NOTICE 'SUCCESS: Description nettoyée fonctionne parfaitement !';
            RAISE NOTICE 'SOLUTION TROUVÉE: Utilisez la fonction clean_description() pour nettoyer vos descriptions';
            DELETE FROM products WHERE product_id = test_product_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR même avec description nettoyée: %', SQLERRM;
        END;
    END IF;
END $$;

-- Afficher la solution
SELECT 'SOLUTION FINALE:' as titre
UNION ALL
SELECT 'Remplacez dans votre description:'
UNION ALL
SELECT '… par ...'
UNION ALL
SELECT 'Ou utilisez: SELECT clean_description(''votre description'');';
