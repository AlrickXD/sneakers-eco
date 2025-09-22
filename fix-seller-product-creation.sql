-- Script de correction pour les problèmes d'ajout de produit par les vendeurs
-- À exécuter après avoir identifié les problèmes avec debug-seller-product-creation.sql
-- Compatible avec Supabase SQL Editor

SELECT '=== CORRECTION AJOUT PRODUIT VENDEUR ===' as correction;

-- 1. S'assurer que RLS est activé
SELECT '1. ACTIVATION RLS' as section;
SELECT '=================' as separator;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

SELECT 'RLS activé sur toutes les tables principales.' as status;

-- 2. Supprimer les anciennes politiques potentiellement problématiques
SELECT '2. NETTOYAGE ANCIENNES POLITIQUES' as section;
SELECT '==================================' as separator;

-- Supprimer toutes les politiques existantes sur products
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'products'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON products', policy_record.policyname);
    END LOOP;
END $$;

-- Supprimer toutes les politiques existantes sur product_variants
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'product_variants'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON product_variants', policy_record.policyname);
    END LOOP;
END $$;

SELECT 'Anciennes politiques supprimées.' as status;

-- 3. Créer les politiques RLS correctes pour products
SELECT '3. POLITIQUES RLS PRODUCTS' as section;
SELECT '==========================' as separator;

-- Lecture publique des produits
CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (true);

-- Les vendeurs peuvent créer leurs propres produits
CREATE POLICY "Sellers can insert their own products" ON products
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'vendeur'
        )
        AND seller_id = auth.uid()
    );

-- Les vendeurs peuvent modifier leurs propres produits
CREATE POLICY "Sellers can update their own products" ON products
    FOR UPDATE 
    USING (seller_id = auth.uid())
    WITH CHECK (
        seller_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'vendeur'
        )
    );

-- Les vendeurs peuvent supprimer leurs propres produits
CREATE POLICY "Sellers can delete their own products" ON products
    FOR DELETE 
    USING (
        seller_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'vendeur'
        )
    );

-- Les admins peuvent tout faire
CREATE POLICY "Admins can do everything on products" ON products
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

SELECT 'Politiques RLS créées pour products.' as status;

-- 4. Créer les politiques RLS correctes pour product_variants
SELECT '4. POLITIQUES RLS PRODUCT_VARIANTS' as section;
SELECT '==================================' as separator;

-- Lecture publique des variantes
CREATE POLICY "Public can view product_variants" ON product_variants
    FOR SELECT USING (true);

-- Les vendeurs peuvent créer leurs propres variantes
CREATE POLICY "Sellers can insert their own variants" ON product_variants
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'vendeur'
        )
        AND seller_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM products 
            WHERE products.product_id = product_variants.product_id 
            AND products.seller_id = auth.uid()
        )
    );

-- Les vendeurs peuvent modifier leurs propres variantes
CREATE POLICY "Sellers can update their own variants" ON product_variants
    FOR UPDATE 
    USING (seller_id = auth.uid())
    WITH CHECK (
        seller_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'vendeur'
        )
        AND EXISTS (
            SELECT 1 FROM products 
            WHERE products.product_id = product_variants.product_id 
            AND products.seller_id = auth.uid()
        )
    );

-- Les vendeurs peuvent supprimer leurs propres variantes
CREATE POLICY "Sellers can delete their own variants" ON product_variants
    FOR DELETE 
    USING (
        seller_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'vendeur'
        )
    );

-- Les admins peuvent tout faire
CREATE POLICY "Admins can do everything on variants" ON product_variants
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

SELECT 'Politiques RLS créées pour product_variants.' as status;

-- 5. Vérifier et corriger les permissions de base
SELECT '5. PERMISSIONS DE BASE' as section;
SELECT '=====================' as separator;

-- Accorder les permissions nécessaires aux utilisateurs authentifiés
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON product_variants TO authenticated;
GRANT SELECT ON profiles TO authenticated;

-- Accorder les permissions sur les séquences si elles existent
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

SELECT 'Permissions de base accordées.' as status;

-- 6. Créer ou corriger le bucket de storage pour les images
SELECT '6. STORAGE IMAGES' as section;
SELECT '=================' as separator;

-- Créer le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];

-- Supprimer les anciennes politiques de storage
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can update their product images" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can delete their product images" ON storage.objects;

-- Politiques pour le storage des images
CREATE POLICY "Public can view product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Sellers can upload product images" ON storage.objects
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'product-images'
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('vendeur', 'admin')
        )
    );

CREATE POLICY "Sellers can update their product images" ON storage.objects
    FOR UPDATE 
    USING (
        bucket_id = 'product-images'
        AND owner = auth.uid()
    )
    WITH CHECK (
        bucket_id = 'product-images'
        AND owner = auth.uid()
    );

CREATE POLICY "Sellers can delete their product images" ON storage.objects
    FOR DELETE 
    USING (
        bucket_id = 'product-images'
        AND (
            owner = auth.uid()
            OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
            )
        )
    );

SELECT 'Storage et politiques d''images configurés.' as status;

-- 7. Créer des index pour améliorer les performances
SELECT '7. INDEX PERFORMANCE' as section;
SELECT '===================' as separator;

-- Index sur seller_id pour les requêtes vendeur
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_seller_id ON product_variants(seller_id);

-- Index sur product_id pour les relations
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- Index sur les champs de recherche
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('french', name));
CREATE INDEX IF NOT EXISTS idx_product_variants_name ON product_variants USING gin(to_tsvector('french', name));
CREATE INDEX IF NOT EXISTS idx_product_variants_brand ON product_variants(brand);
CREATE INDEX IF NOT EXISTS idx_product_variants_categorie ON product_variants(categorie);
CREATE INDEX IF NOT EXISTS idx_product_variants_etat ON product_variants(etat);
CREATE INDEX IF NOT EXISTS idx_product_variants_taille ON product_variants(taille);

SELECT 'Index créés pour améliorer les performances.' as status;

-- 8. Fonction helper pour vérifier les permissions vendeur
SELECT '8. FONCTIONS HELPER' as section;
SELECT '=================' as separator;

CREATE OR REPLACE FUNCTION is_seller()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'vendeur'
    );
END;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    );
END;
$$;

SELECT 'Fonctions helper créées.' as status;

-- 9. Vérifier que les contraintes sont correctes
SELECT '9. VÉRIFICATION CONTRAINTES' as section;
SELECT '===========================' as separator;

-- S'assurer que les clés étrangères sont correctes
ALTER TABLE product_variants 
DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;

ALTER TABLE product_variants 
ADD CONSTRAINT product_variants_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;

-- S'assurer que seller_id référence auth.users
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_seller_id_fkey;

ALTER TABLE products 
ADD CONSTRAINT products_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE product_variants 
DROP CONSTRAINT IF EXISTS product_variants_seller_id_fkey;

ALTER TABLE product_variants 
ADD CONSTRAINT product_variants_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES auth.users(id) ON DELETE CASCADE;

SELECT 'Contraintes vérifiées et corrigées.' as status;

-- 10. Test final
SELECT '10. TEST FINAL' as section;
SELECT '==============' as separator;

-- Créer un utilisateur test si nécessaire pour valider
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test-fix@example.com') THEN
        INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
        VALUES (
            '00000000-0000-0000-0000-000000000002'::uuid,
            'test-fix@example.com',
            NOW(),
            NOW(),
            NOW()
        );
        
        INSERT INTO profiles (id, role, display_name, created_at)
        VALUES (
            '00000000-0000-0000-0000-000000000002'::uuid,
            'vendeur',
            'Test Fix Seller',
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'vendeur',
            display_name = 'Test Fix Seller';
    END IF;
END $$;

-- Test d'insertion complète
DO $$
BEGIN
    BEGIN
        -- Test produit
        INSERT INTO products (product_id, name, categorie, description, images, seller_id)
        VALUES (
            'TEST-FIX-001',
            'Test Fix Product',
            'Homme',
            'Produit de test après correction',
            'https://example.com/test.jpg',
            '00000000-0000-0000-0000-000000000002'::uuid
        );
        
        -- Test variante
        INSERT INTO product_variants (
            sku, product_id, name, brand, etat, taille, categorie, 
            prix_eur, stock, images, couleur, description, seller_id
        )
        VALUES (
            'TEST-FIX-001-42-neuf',
            'TEST-FIX-001',
            'Test Fix Product - Taille 42',
            'Nike',
            'NEUF',
            42,
            'Homme',
            129.99,
            3,
            'https://example.com/test.jpg',
            'NOIR',
            'Produit de test après correction en taille 42',
            '00000000-0000-0000-0000-000000000002'::uuid
        );
        
        RAISE NOTICE 'SUCCESS: Test d''insertion complète réussi après correction !';
        
        -- Nettoyer les données de test
        DELETE FROM product_variants WHERE product_id = 'TEST-FIX-001';
        DELETE FROM products WHERE product_id = 'TEST-FIX-001';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: Test échoué - %', SQLERRM;
        -- Nettoyer en cas d'erreur
        DELETE FROM product_variants WHERE product_id = 'TEST-FIX-001';
        DELETE FROM products WHERE product_id = 'TEST-FIX-001';
    END;
END $$;

SELECT '=== CORRECTION TERMINÉE ===' as final_status
UNION ALL
SELECT 'Les politiques RLS, permissions et contraintes ont été corrigées.'
UNION ALL
SELECT 'Les vendeurs devraient maintenant pouvoir ajouter des produits sans erreur.'
UNION ALL
SELECT ''
UNION ALL
SELECT 'Pour vérifier que tout fonctionne:'
UNION ALL
SELECT '1. Connectez-vous en tant que vendeur'
UNION ALL
SELECT '2. Essayez d''ajouter un produit'
UNION ALL
SELECT '3. Si des erreurs persistent, vérifiez les logs de la console du navigateur';
