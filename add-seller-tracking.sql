-- =====================================================
-- AJOUT DU SUIVI DES VENDEURS PAR PRODUIT
-- =====================================================

-- 1. Ajouter le champ seller_id à la table products
ALTER TABLE products 
ADD COLUMN seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Ajouter le champ seller_id à la table product_variants
ALTER TABLE product_variants 
ADD COLUMN seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Créer un index pour optimiser les requêtes par vendeur
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_seller_id ON product_variants(seller_id);

-- 4. Mettre à jour les policies RLS pour les produits
DROP POLICY IF EXISTS "Vendeurs peuvent voir leurs produits" ON products;
CREATE POLICY "Vendeurs peuvent voir leurs produits" ON products
FOR SELECT USING (
  auth.uid() = seller_id OR 
  seller_id IS NULL OR
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Vendeurs peuvent créer des produits" ON products;
CREATE POLICY "Vendeurs peuvent créer des produits" ON products
FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Vendeurs peuvent modifier leurs produits" ON products;
CREATE POLICY "Vendeurs peuvent modifier leurs produits" ON products
FOR UPDATE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Vendeurs peuvent supprimer leurs produits" ON products;
CREATE POLICY "Vendeurs peuvent supprimer leurs produits" ON products
FOR DELETE USING (auth.uid() = seller_id);

-- 5. Mettre à jour les policies RLS pour les variantes
DROP POLICY IF EXISTS "Vendeurs peuvent voir leurs variantes" ON product_variants;
CREATE POLICY "Vendeurs peuvent voir leurs variantes" ON product_variants
FOR SELECT USING (
  auth.uid() = seller_id OR 
  seller_id IS NULL OR
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Vendeurs peuvent créer des variantes" ON product_variants;
CREATE POLICY "Vendeurs peuvent créer des variantes" ON product_variants
FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Vendeurs peuvent modifier leurs variantes" ON product_variants;
CREATE POLICY "Vendeurs peuvent modifier leurs variantes" ON product_variants
FOR UPDATE USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Vendeurs peuvent supprimer leurs variantes" ON product_variants;
CREATE POLICY "Vendeurs peuvent supprimer leurs variantes" ON product_variants
FOR DELETE USING (auth.uid() = seller_id);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Suivi des vendeurs ajouté avec succès !';
    RAISE NOTICE 'Les vendeurs ne peuvent maintenant gérer que leurs propres produits.';
END $$;
