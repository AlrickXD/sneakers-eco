-- =====================================================
-- POLICIES RLS SIMPLIFIÉES SANS RÉCURSION
-- Alternative au fichier supabase.sql principal
-- =====================================================

-- Désactiver RLS temporairement pour nettoyer
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les policies existantes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;

-- Réactiver RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- POLICIES SIMPLIFIÉES POUR PROFILES (sans récursion)
-- Chaque utilisateur peut voir et modifier son propre profil
CREATE POLICY "profiles_own_access" ON profiles
  FOR ALL USING (auth.uid() = id);

-- POLICIES POUR ORDERS
-- Les utilisateurs peuvent gérer leurs propres commandes
CREATE POLICY "orders_own_access" ON orders
  FOR ALL USING (auth.uid() = user_id);

-- POLICIES POUR ORDER_ITEMS
-- Les utilisateurs peuvent voir les items de leurs commandes
CREATE POLICY "order_items_own_access" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- POLICIES POUR PRODUCTS (lecture publique)
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (true);

-- POLICIES POUR PRODUCT_VARIANTS (lecture publique)
CREATE POLICY "variants_public_read" ON product_variants
  FOR SELECT USING (true);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Policies simplifiées appliquées !';
    RAISE NOTICE 'Note: Les rôles vendeur/admin sont gérés côté application.';
    RAISE NOTICE 'RLS est activé pour la sécurité de base.';
END $$;
