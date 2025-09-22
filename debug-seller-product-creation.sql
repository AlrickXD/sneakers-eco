-- Script de diagnostic pour les problèmes d'ajout de produit par les vendeurs
-- Ce script vérifie les permissions, politiques RLS, et structure de la base de données
-- Compatible avec Supabase SQL Editor

SELECT '=== DIAGNOSTIC AJOUT PRODUIT VENDEUR ===' as diagnostic;

-- 1. Vérifier la structure des tables
SELECT '1. STRUCTURE DES TABLES' as section;
SELECT '======================' as separator;

SELECT 'Structure de la table products:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

SELECT 'Structure de la table product_variants:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
ORDER BY ordinal_position;

SELECT 'Structure de la table profiles:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Vérifier les politiques RLS
SELECT '2. POLITIQUES RLS' as section;
SELECT '================' as separator;

SELECT 'Politiques RLS sur products:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY policyname;

SELECT 'Politiques RLS sur product_variants:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'product_variants'
ORDER BY policyname;

SELECT 'Politiques RLS sur profiles:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 3. Vérifier les permissions de base
SELECT '3. PERMISSIONS DE BASE' as section;
SELECT '=====================' as separator;

SELECT 'Permissions sur products:' as info;
SELECT grantee, privilege_type, is_grantable 
FROM information_schema.table_privileges 
WHERE table_name = 'products'
ORDER BY grantee, privilege_type;

SELECT 'Permissions sur product_variants:' as info;
SELECT grantee, privilege_type, is_grantable 
FROM information_schema.table_privileges 
WHERE table_name = 'product_variants'
ORDER BY grantee, privilege_type;

-- 4. Vérifier les contraintes
SELECT '4. CONTRAINTES' as section;
SELECT '==============' as separator;

SELECT 'Contraintes sur products:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'products'::regclass
ORDER BY conname;

SELECT 'Contraintes sur product_variants:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'product_variants'::regclass
ORDER BY conname;

-- 5. Vérifier les index
SELECT '5. INDEX' as section;
SELECT '========' as separator;

SELECT 'Index sur products:' as info;
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'products'
ORDER BY indexname;

SELECT 'Index sur product_variants:' as info;
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'product_variants'
ORDER BY indexname;

-- 6. Tester les permissions avec un utilisateur vendeur fictif
SELECT '6. TEST PERMISSIONS VENDEUR' as section;
SELECT '==========================' as separator;

-- Créer un utilisateur test temporaire (si pas déjà existant)
DO $$
BEGIN
    -- Vérifier si l'utilisateur test existe dans auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test-seller@example.com') THEN
        RAISE NOTICE 'Création d''un utilisateur test vendeur...';
        INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
        VALUES (
            '00000000-0000-0000-0000-000000000001'::uuid,
            'test-seller@example.com',
            NOW(),
            NOW(),
            NOW()
        );
        
        -- Créer le profil vendeur correspondant
        INSERT INTO profiles (id, role, display_name, created_at)
        VALUES (
            '00000000-0000-0000-0000-000000000001'::uuid,
            'vendeur',
            'Test Seller',
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'vendeur',
            display_name = 'Test Seller';
    END IF;
END $$;

-- Tester l'insertion dans products avec l'utilisateur test
SELECT 'Test insertion dans products avec utilisateur vendeur:' as test_info;

-- Test d'insertion dans products
DO $$
BEGIN
    BEGIN
        INSERT INTO products (product_id, name, categorie, description, images, seller_id)
        VALUES (
            'TEST-PRODUCT-001',
            'Test Nike Air Force 1',
            'Homme',
            'Chaussure de test pour diagnostic',
            'https://example.com/image1.jpg|https://example.com/image2.jpg',
            '00000000-0000-0000-0000-000000000001'::uuid
        );
        
        RAISE NOTICE 'SUCCESS: Insertion dans products réussie';
        
        -- Nettoyer immédiatement
        DELETE FROM products WHERE product_id = 'TEST-PRODUCT-001';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Insertion dans products échouée - %', SQLERRM;
    END;
END $$;

-- Test d'insertion dans product_variants
SELECT 'Test insertion dans product_variants:' as test_info;

DO $$
BEGIN
    BEGIN
        -- D'abord insérer le produit
        INSERT INTO products (product_id, name, categorie, description, images, seller_id)
        VALUES (
            'TEST-PRODUCT-002',
            'Test Nike Air Force 1 Variants',
            'Homme',
            'Chaussure de test pour diagnostic variants',
            'https://example.com/image1.jpg',
            '00000000-0000-0000-0000-000000000001'::uuid
        );
        
        -- Puis insérer la variante
        INSERT INTO product_variants (
            sku, product_id, name, brand, etat, taille, categorie, 
            prix_eur, stock, images, couleur, description, seller_id
        )
        VALUES (
            'TEST-PRODUCT-002-40-neuf',
            'TEST-PRODUCT-002',
            'Test Nike Air Force 1 Variants - Taille 40',
            'Nike',
            'NEUF',
            40,
            'Homme',
            99.99,
            5,
            'https://example.com/image1.jpg',
            'BLANC',
            'Test variante en taille 40',
            '00000000-0000-0000-0000-000000000001'::uuid
        );
        
        RAISE NOTICE 'SUCCESS: Insertion dans product_variants réussie';
        
        -- Nettoyer les données de test
        DELETE FROM product_variants WHERE product_id = 'TEST-PRODUCT-002';
        DELETE FROM products WHERE product_id = 'TEST-PRODUCT-002';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Insertion dans product_variants échouée - %', SQLERRM;
        -- Nettoyer en cas d'erreur aussi
        DELETE FROM product_variants WHERE product_id = 'TEST-PRODUCT-002';
        DELETE FROM products WHERE product_id = 'TEST-PRODUCT-002';
    END;
END $$;

-- 7. Vérifier les données existantes problématiques
SELECT '7. DONNÉES EXISTANTES' as section;
SELECT '====================' as separator;

SELECT 'Nombre total de produits:' as info;
SELECT COUNT(*) as total_products FROM products;

SELECT 'Nombre total de variantes:' as info;
SELECT COUNT(*) as total_variants FROM product_variants;

SELECT 'Produits sans variantes:' as info;
SELECT p.product_id, p.name, p.seller_id
FROM products p
LEFT JOIN product_variants pv ON p.product_id = pv.product_id
WHERE pv.product_id IS NULL
LIMIT 10;

SELECT 'Variantes orphelines (sans produit parent):' as info;
SELECT pv.sku, pv.product_id, pv.name
FROM product_variants pv
LEFT JOIN products p ON pv.product_id = p.product_id
WHERE p.product_id IS NULL
LIMIT 10;

SELECT 'Produits avec seller_id NULL:' as info;
SELECT product_id, name, seller_id
FROM products
WHERE seller_id IS NULL
LIMIT 10;

SELECT 'Variantes avec seller_id NULL:' as info;
SELECT sku, product_id, name, seller_id
FROM product_variants
WHERE seller_id IS NULL
LIMIT 10;

-- 8. Vérifier les profils vendeur
SELECT '8. PROFILS VENDEUR' as section;
SELECT '==================' as separator;

SELECT 'Nombre de profils par rôle:' as info;
SELECT role, COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY role;

SELECT 'Vendeurs actifs avec produits:' as info;
SELECT p.id, p.display_name, COUNT(pr.product_id) as nb_products
FROM profiles p
LEFT JOIN products pr ON p.id = pr.seller_id
WHERE p.role = 'vendeur'
GROUP BY p.id, p.display_name
ORDER BY nb_products DESC
LIMIT 10;

-- 9. Vérifier le storage pour les images
SELECT '9. STORAGE IMAGES' as section;
SELECT '=================' as separator;

SELECT 'Buckets de storage:' as info;
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name LIKE '%product%' OR name LIKE '%image%';

SELECT 'Politiques sur le bucket product-images:' as info;
SELECT policyname, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%product%'
ORDER BY policyname;

-- 10. Recommandations
SELECT '10. RECOMMANDATIONS' as section;
SELECT '===================' as separator;

SELECT 'Vérifications terminées. Analysez les résultats ci-dessus pour identifier:' as info
UNION ALL
SELECT '- Les politiques RLS manquantes ou incorrectes'
UNION ALL
SELECT '- Les contraintes qui pourraient bloquer l''insertion'
UNION ALL
SELECT '- Les permissions insuffisantes'
UNION ALL
SELECT '- Les données orphelines ou incohérentes'
UNION ALL
SELECT '- Les problèmes de configuration du storage'
UNION ALL
SELECT ''
UNION ALL
SELECT 'Si des erreurs sont trouvées, utilisez les scripts de correction appropriés.';
