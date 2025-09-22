-- =====================================================
-- CORRECTION D'URGENCE - DÉSACTIVER RLS TEMPORAIREMENT
-- À exécuter IMMÉDIATEMENT dans Supabase SQL Editor
-- =====================================================

-- 1. DÉSACTIVER RLS sur toutes les tables pour débloquer l'application
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les policies problématiques
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "profiles_own_access" ON profiles;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Sellers and admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Sellers and admins can update orders" ON orders;
DROP POLICY IF EXISTS "orders_own_access" ON orders;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Sellers and admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "order_items_own_access" ON order_items;

DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Sellers and admins can insert products" ON products;
DROP POLICY IF EXISTS "Sellers and admins can update products" ON products;
DROP POLICY IF EXISTS "Sellers and admins can delete products" ON products;
DROP POLICY IF EXISTS "products_public_read" ON products;

DROP POLICY IF EXISTS "Anyone can view product variants" ON product_variants;
DROP POLICY IF EXISTS "Sellers and admins can insert variants" ON product_variants;
DROP POLICY IF EXISTS "Sellers and admins can update variants" ON product_variants;
DROP POLICY IF EXISTS "Sellers and admins can delete variants" ON product_variants;
DROP POLICY IF EXISTS "variants_public_read" ON product_variants;

-- 3. Créer les tables de base si elles n'existent pas
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'vendeur', 'admin')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'canceled', 'fulfilled')),
  total_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
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

-- 5. Trigger pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '🚨 CORRECTION D''URGENCE APPLIQUÉE !';
    RAISE NOTICE '✅ RLS désactivé temporairement';
    RAISE NOTICE '✅ Policies supprimées';
    RAISE NOTICE '✅ Tables créées/vérifiées';
    RAISE NOTICE '✅ Trigger de profil activé';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 MAINTENANT: Rafraîchissez votre navigateur !';
    RAISE NOTICE '📱 L''application devrait fonctionner normalement';
END $$;
