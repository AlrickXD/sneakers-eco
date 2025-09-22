-- ÉTAPE 2: Tester l'insertion avec description simple
-- Exécutez cette section après l'étape 1

-- Récupérer votre ID vendeur
SELECT 'VOS VENDEURS DISPONIBLES:' as info;
SELECT id, display_name, role FROM profiles WHERE role = 'vendeur';

-- Test avec description simple (doit fonctionner)
DO $$
DECLARE
    test_seller_id UUID;
    test_product_id TEXT := 'SIMPLE-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
    SELECT id INTO test_seller_id FROM profiles WHERE role = 'vendeur' LIMIT 1;
    
    IF test_seller_id IS NOT NULL THEN
        BEGIN
            INSERT INTO products (product_id, name, categorie, description, seller_id)
            VALUES (
                test_product_id,
                'Test Description Simple',
                'Homme',
                'dfsfs',
                test_seller_id
            );
            RAISE NOTICE 'SUCCESS: Description simple fonctionne parfaitement';
            DELETE FROM products WHERE product_id = test_product_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR avec description simple: %', SQLERRM;
        END;
    END IF;
END $$;
