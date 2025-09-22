-- Script de diagnostic simplifié pour les problèmes d'ajout de produit par les vendeurs
-- Compatible avec Supabase SQL Editor

-- 1. Vérifier la structure des tables principales
SELECT 'DIAGNOSTIC AJOUT PRODUIT VENDEUR' as titre;
SELECT '===================================' as separateur;

-- Vérifier l'existence des tables
SELECT 'Tables existantes:' as info;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_name IN ('products', 'product_variants', 'profiles')
AND table_schema = 'public'
ORDER BY table_name;

-- 2. Vérifier les politiques RLS
SELECT 'Politiques RLS actives:' as info;
SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename IN ('products', 'product_variants')
ORDER BY tablename, policyname;

-- 3. Vérifier les permissions de base
SELECT 'Permissions sur les tables:' as info;
SELECT table_name, grantee, privilege_type
FROM information_schema.table_privileges 
WHERE table_name IN ('products', 'product_variants')
AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;

-- 4. Vérifier les contraintes importantes
SELECT 'Contraintes clés étrangères:' as info;
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('products', 'product_variants')
ORDER BY tc.table_name;

-- 5. Vérifier le bucket de storage
SELECT 'Configuration storage:' as info;
SELECT id, name, public, file_size_limit
FROM storage.buckets 
WHERE name = 'product-images';

-- 6. Vérifier les politiques de storage
SELECT 'Politiques storage:' as info;
SELECT policyname, cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%product%'
ORDER BY policyname;

-- 7. Compter les données existantes
SELECT 'Statistiques données:' as info;
SELECT 
    'products' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN seller_id IS NULL THEN 1 END) as rows_without_seller
FROM products
UNION ALL
SELECT 
    'product_variants',
    COUNT(*),
    COUNT(CASE WHEN seller_id IS NULL THEN 1 END)
FROM product_variants;

-- 8. Vérifier les profils vendeurs
SELECT 'Profils par rôle:' as info;
SELECT role, COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY role;

-- 9. Test simple d'insertion (création d'un utilisateur test si nécessaire)
DO $$
BEGIN
    -- Créer un utilisateur test s'il n'existe pas
    INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
    VALUES (
        '00000000-0000-0000-0000-000000000999'::uuid,
        'test-diagnostic@example.com',
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Créer le profil vendeur correspondant
    INSERT INTO profiles (id, role, display_name, created_at)
    VALUES (
        '00000000-0000-0000-0000-000000000999'::uuid,
        'vendeur',
        'Test Diagnostic Seller',
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'vendeur',
        display_name = 'Test Diagnostic Seller';
END $$;

-- Test d'insertion dans products
SELECT 'Test insertion products:' as info;
DO $$
BEGIN
    BEGIN
        INSERT INTO products (product_id, name, categorie, description, images, seller_id)
        VALUES (
            'DIAGNOSTIC-TEST-001',
            'Test Diagnostic Product',
            'Homme',
            'Produit de test pour diagnostic',
            'https://example.com/test.jpg',
            '00000000-0000-0000-0000-000000000999'::uuid
        );
        
        RAISE NOTICE 'SUCCESS: Insertion products réussie';
        
        -- Test d'insertion dans product_variants
        INSERT INTO product_variants (
            sku, product_id, name, brand, etat, taille, categorie, 
            prix_eur, stock, images, couleur, description, seller_id
        )
        VALUES (
            'DIAGNOSTIC-TEST-001-42-neuf',
            'DIAGNOSTIC-TEST-001',
            'Test Diagnostic Product - Taille 42',
            'Nike',
            'NEUF',
            42,
            'Homme',
            99.99,
            1,
            'https://example.com/test.jpg',
            'NOIR',
            'Test diagnostic variante',
            '00000000-0000-0000-0000-000000000999'::uuid
        );
        
        RAISE NOTICE 'SUCCESS: Insertion product_variants réussie';
        
        -- Nettoyer les données de test
        DELETE FROM product_variants WHERE product_id = 'DIAGNOSTIC-TEST-001';
        DELETE FROM products WHERE product_id = 'DIAGNOSTIC-TEST-001';
        
        RAISE NOTICE 'SUCCESS: Tests terminés avec succès - Pas de problème détecté !';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Test échoué - %', SQLERRM;
        -- Nettoyer en cas d'erreur
        DELETE FROM product_variants WHERE product_id = 'DIAGNOSTIC-TEST-001';
        DELETE FROM products WHERE product_id = 'DIAGNOSTIC-TEST-001';
    END;
END $$;

-- 10. Résumé et recommandations
SELECT 'RÉSUMÉ DIAGNOSTIC:' as info
UNION ALL
SELECT '=================='
UNION ALL
SELECT 'Si vous voyez "SUCCESS" ci-dessus, tout fonctionne correctement.'
UNION ALL
SELECT 'Si vous voyez "ERROR", exécutez le script fix-seller-product-creation-simple.sql'
UNION ALL
SELECT 'Vérifiez aussi que votre utilisateur a bien le rôle "vendeur" dans la table profiles.';
