-- =====================================================
-- CORRECTION DES POLITIQUES RLS - URGENT
-- Appliquer après avoir identifié le problème d'ajout de produits
-- =====================================================

-- 1. Corriger les politiques pour products
DROP POLICY IF EXISTS "Sellers and admins can insert products" ON products;
CREATE POLICY "Sellers and admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

DROP POLICY IF EXISTS "Sellers and admins can update products" ON products;
CREATE POLICY "Sellers and admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

DROP POLICY IF EXISTS "Sellers and admins can delete products" ON products;
CREATE POLICY "Sellers and admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

-- 2. Corriger les politiques pour product_variants
DROP POLICY IF EXISTS "Sellers and admins can insert variants" ON product_variants;
CREATE POLICY "Sellers and admins can insert variants" ON product_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

DROP POLICY IF EXISTS "Sellers and admins can update variants" ON product_variants;
CREATE POLICY "Sellers and admins can update variants" ON product_variants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

DROP POLICY IF EXISTS "Sellers and admins can delete variants" ON product_variants;
CREATE POLICY "Sellers and admins can delete variants" ON product_variants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

-- 3. Corriger les politiques pour orders
DROP POLICY IF EXISTS "Sellers and admins can view all orders" ON orders;
CREATE POLICY "Sellers and admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Sellers and admins can update orders" ON orders;
CREATE POLICY "Sellers and admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

-- 4. Corriger les politiques pour order_items
DROP POLICY IF EXISTS "Sellers and admins can view all order items" ON order_items;
CREATE POLICY "Sellers and admins can view all order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- 5. Corriger les politiques pour profiles (admins uniquement)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR auth.uid() = id
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR auth.uid() = id
  );

-- =====================================================
-- INSTRUCTIONS D'APPLICATION :
-- 1. Copier ce contenu
-- 2. Aller dans Supabase Dashboard > SQL Editor
-- 3. Coller et exécuter cette requête
-- 4. Tester l'ajout de produit
-- =====================================================