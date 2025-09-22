-- =====================================================
-- DÉBOGAGE DES PERMISSIONS - VÉRIFICATION RAPIDE
-- =====================================================

-- 1. Vérifier les tables existantes
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('products', 'product_variants', 'profiles', 'orders', 'order_items')
ORDER BY table_name;

-- 2. Vérifier les politiques RLS actives
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('products', 'product_variants', 'profiles', 'orders', 'order_items')
ORDER BY tablename, policyname;

-- 3. Vérifier le profil de l'utilisateur actuel
SELECT id, role, display_name
FROM profiles
WHERE id = auth.uid();

-- 4. Tester l'insertion d'un produit (test uniquement)
-- DO $$
-- DECLARE
--     test_product_id TEXT := 'TEST-' || extract(epoch from now());
--     test_user_id UUID := auth.uid();
-- BEGIN
--     -- Test insertion dans products
--     INSERT INTO products (product_id, name, categorie, description, seller_id)
--     VALUES (test_product_id, 'Test Product', 'Test', 'Test Description', test_user_id);
--
--     RAISE NOTICE '✅ Test insertion products réussi pour ID: %', test_product_id;
--
--     -- Nettoyage
--     DELETE FROM products WHERE product_id = test_product_id;
--     RAISE NOTICE '🧹 Test nettoyé';
-- END $$;

-- 5. Afficher les erreurs RLS si elles existent
SELECT * FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND relname IN ('products', 'product_variants', 'profiles');

-- =====================================================
-- RÉSULTATS ATTENDUS :
-- - Tables doivent exister
-- - Politiques RLS doivent être actives et utiliser profiles.role
-- - Profil utilisateur doit avoir le bon rôle
-- =====================================================
