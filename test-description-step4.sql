-- ÉTAPE 4: Tester avec les points de suspension Unicode (SUSPECT PRINCIPAL)
-- Exécutez cette section après l'étape 3

DO $$
DECLARE
    test_seller_id UUID;
    test_product_id TEXT := 'UNICODE-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
    SELECT id INTO test_seller_id FROM profiles WHERE role = 'vendeur' LIMIT 1;
    
    IF test_seller_id IS NOT NULL THEN
        BEGIN
            INSERT INTO products (product_id, name, categorie, description, seller_id)
            VALUES (
                test_product_id,
                'Test Points Suspension Unicode',
                'Homme',
                'Les possibilités sont infinies… Et toi ?',
                test_seller_id
            );
            RAISE NOTICE 'SUCCESS: Points de suspension Unicode fonctionnent';
            DELETE FROM products WHERE product_id = test_product_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR avec points de suspension Unicode (…): %', SQLERRM;
            RAISE NOTICE 'PROBLÈME IDENTIFIÉ: Les points de suspension Unicode (…) sont la cause du problème!';
        END;
    END IF;
END $$;
