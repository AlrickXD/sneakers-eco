-- Script de correction simplifié pour les problèmes d'ajout de produit par les vendeurs
-- Compatible avec Supabase SQL Editor

-- 1. Activer RLS sur toutes les tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Sellers can insert their own products" ON products;
DROP POLICY IF EXISTS "Sellers can update their own products" ON products;
DROP POLICY IF EXISTS "Sellers can delete their own products" ON products;
DROP POLICY IF EXISTS "Admins can do everything on products" ON products;

DROP POLICY IF EXISTS "Public can view product_variants" ON product_variants;
DROP POLICY IF EXISTS "Sellers can insert their own variants" ON product_variants;
DROP POLICY IF EXISTS "Sellers can update their own variants" ON product_variants;
DROP POLICY IF EXISTS "Sellers can delete their own variants" ON product_variants;
DROP POLICY IF EXISTS "Admins can do everything on variants" ON product_variants;

-- 3. Créer les politiques RLS correctes pour products
CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (true);

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

-- 4. Créer les politiques RLS correctes pour product_variants
CREATE POLICY "Public can view product_variants" ON product_variants
    FOR SELECT USING (true);

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

-- 5. Accorder les permissions de base
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON product_variants TO authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 6. Configurer le storage pour les images
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

-- 7. Politiques pour le storage des images
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can update their product images" ON storage.objects;
DROP POLICY IF EXISTS "Sellers can delete their product images" ON storage.objects;

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

-- 8. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_seller_id ON product_variants(seller_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- 9. Vérifier les contraintes de clés étrangères
ALTER TABLE product_variants 
DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;

ALTER TABLE product_variants 
ADD CONSTRAINT product_variants_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;

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

-- 10. Message de confirmation
SELECT 'CORRECTION TERMINÉE - Les vendeurs peuvent maintenant ajouter des produits !' as status;
