-- Script pour vérifier la vraie structure de votre base de données
-- Compatible avec Supabase SQL Editor

SELECT 'STRUCTURE RÉELLE DE VOTRE BASE DE DONNÉES' as titre;
SELECT '===========================================' as separateur;

-- 1. Vérifier toutes les colonnes de la table products
SELECT 'Colonnes de la table PRODUCTS:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier toutes les colonnes de la table product_variants
SELECT 'Colonnes de la table PRODUCT_VARIANTS:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier toutes les colonnes de la table profiles
SELECT 'Colonnes de la table PROFILES:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Lister toutes les tables existantes
SELECT 'TOUTES LES TABLES EXISTANTES:' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 5. Vérifier les contraintes principales
SELECT 'CONTRAINTES PRINCIPALES:' as info;
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('products', 'product_variants', 'profiles')
ORDER BY tc.table_name, tc.constraint_type;

-- 6. Échantillon de données pour comprendre le format
SELECT 'ÉCHANTILLON DONNÉES PRODUCTS (5 premiers):' as info;
SELECT * FROM products LIMIT 5;

SELECT 'ÉCHANTILLON DONNÉES PRODUCT_VARIANTS (5 premiers):' as info;
SELECT * FROM product_variants LIMIT 5;

SELECT 'ÉCHANTILLON DONNÉES PROFILES (5 premiers):' as info;
SELECT * FROM profiles LIMIT 5;
