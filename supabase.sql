-- =====================================================
-- MIGRATIONS SQL POUR SNEAKERS-ECO
-- À coller dans Supabase SQL Editor
-- =====================================================

-- 1. Table profiles (liée à auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'vendeur', 'admin')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'canceled', 'fulfilled')),
  total_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table order_items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku TEXT NOT NULL REFERENCES product_variants(sku),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price_eur NUMERIC(10,2) NOT NULL
);

-- 4. Fonction pour décrémenter le stock
CREATE OR REPLACE FUNCTION decrement_stock_by_sku(p_sku TEXT, p_qty INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE product_variants
  SET stock = GREATEST(stock - p_qty, 0)
  WHERE sku = p_sku;
END;
$$;

-- 5. Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_sku ON order_items(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_etat ON product_variants(etat);
CREATE INDEX IF NOT EXISTS idx_product_variants_categorie ON product_variants(categorie);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_etat ON product_variants(product_id, etat);

-- 6. Activer RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- 7. Policies pour profiles (sans récursion)
-- Les utilisateurs peuvent voir et modifier leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Insertion automatique du profil à la création de compte
CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Les admins peuvent tout voir et modifier
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    auth.uid() = id  -- Fallback: au minimum voir son propre profil
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    auth.uid() = id  -- Fallback: au minimum modifier son propre profil
  );

-- 8. Policies pour orders
-- Les utilisateurs peuvent voir leurs propres commandes
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres commandes
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vendeurs et admins peuvent voir toutes les commandes
CREATE POLICY "Sellers and admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
    OR auth.uid() = user_id  -- Fallback: voir ses propres commandes
  );

-- Vendeurs et admins peuvent modifier le statut des commandes
CREATE POLICY "Sellers and admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

-- 9. Policies pour order_items
-- Les utilisateurs peuvent voir les items de leurs commandes
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent insérer des items dans leurs commandes
CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Vendeurs et admins peuvent voir tous les order_items
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
    )  -- Fallback: voir les items de ses propres commandes
  );

-- 10. Policies pour products (lecture publique, écriture vendeur/admin)
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Sellers and admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

CREATE POLICY "Sellers and admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

CREATE POLICY "Sellers and admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

-- 11. Policies pour product_variants (lecture publique, écriture vendeur/admin)
CREATE POLICY "Anyone can view product variants" ON product_variants
  FOR SELECT USING (true);

CREATE POLICY "Sellers and admins can insert variants" ON product_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

CREATE POLICY "Sellers and admins can update variants" ON product_variants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

CREATE POLICY "Sellers and admins can delete variants" ON product_variants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('vendeur', 'admin')
    )
  );

-- 12. Trigger pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 13. Vue pour les statistiques admin (optionnel)
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM orders WHERE status = 'paid') as total_orders,
  (SELECT COALESCE(SUM(total_eur), 0) FROM orders WHERE status = 'paid') as total_revenue,
  (SELECT COUNT(*) FROM product_variants WHERE stock <= 5) as low_stock_items,
  (SELECT COUNT(*) FROM profiles WHERE role = 'client') as total_clients,
  (SELECT COUNT(*) FROM profiles WHERE role = 'vendeur') as total_sellers;

-- =====================================================
-- INSTRUCTIONS D'UTILISATION :
-- 1. Copier tout ce contenu
-- 2. Aller dans Supabase Dashboard > SQL Editor
-- 3. Créer une nouvelle requête et coller le code
-- 4. Exécuter la requête
-- 5. Vérifier que toutes les tables et policies sont créées
-- =====================================================
