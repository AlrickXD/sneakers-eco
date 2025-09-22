-- =====================================================
-- CONFIGURATION DU STORAGE SUPABASE POUR LES IMAGES
-- =====================================================

-- 1. Créer le bucket pour les images de produits
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politique pour permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Utilisateurs authentifiés peuvent uploader" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND 
  auth.role() = 'authenticated'
);

-- 3. Politique pour permettre la lecture publique des images
CREATE POLICY "Images publiquement accessibles" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- 4. Politique pour permettre aux vendeurs de supprimer leurs images
CREATE POLICY "Vendeurs peuvent supprimer leurs images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Storage configuré pour les images de produits !';
    RAISE NOTICE 'Bucket "product-images" créé avec les bonnes politiques.';
END $$;
