-- ÉTAPE 3: Tester avec accents français
-- Exécutez cette section après l'étape 2

DO $$
DECLARE
    test_seller_id UUID;
    test_product_id TEXT := 'ACCENT-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
    SELECT id INTO test_seller_id FROM profiles WHERE role = 'vendeur' LIMIT 1;
    
    IF test_seller_id IS NOT NULL THEN
        BEGIN
            INSERT INTO products (product_id, name, categorie, description, seller_id)
            VALUES (
                test_product_id,
                'Test Accents',
                'Homme',
                'Description avec des accents: été, élégant, qualité, emblématique',
                test_seller_id
            );
            RAISE NOTICE 'SUCCESS: Les accents français fonctionnent';
            DELETE FROM products WHERE product_id = test_product_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR avec accents: %', SQLERRM;
        END;
    END IF;
END $$;
