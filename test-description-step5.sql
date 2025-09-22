-- ÉTAPE 5: Tester votre description complète originale
-- Exécutez cette section après l'étape 4

DO $$
DECLARE
    test_seller_id UUID;
    test_product_id TEXT := 'FULL-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
    SELECT id INTO test_seller_id FROM profiles WHERE role = 'vendeur' LIMIT 1;
    
    IF test_seller_id IS NOT NULL THEN
        BEGIN
            INSERT INTO products (product_id, name, categorie, description, seller_id)
            VALUES (
                test_product_id,
                'Test Description Complète',
                'Homme',
                'On peut toujours compter sur un classique. Color block emblématique. Matières premium. Rembourrage moelleux. La Dunk Low est toujours plus confortable et résistante. Les possibilités sont infinies… Et toi, comment tu vas porter la Dunk ?',
                test_seller_id
            );
            RAISE NOTICE 'SUCCESS: Votre description complète fonctionne !';
            DELETE FROM products WHERE product_id = test_product_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR avec votre description complète: %', SQLERRM;
            RAISE NOTICE 'CONFIRMATION: Il y a un caractère problématique dans votre description';
        END;
    END IF;
END $$;
