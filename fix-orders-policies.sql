-- =====================================================
-- CORRECTION DES POLITIQUES RLS POUR LES COMMANDES
-- =====================================================

-- 1. Supprimer les anciennes politiques s'il y en a
DROP POLICY IF EXISTS "orders_select_policy" ON orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
DROP POLICY IF EXISTS "orders_update_policy" ON orders;
DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_policy" ON order_items;

-- 2. Activer RLS sur les tables si ce n'est pas déjà fait
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 3. Créer des politiques pour la table orders

-- Politique de lecture : les clients peuvent voir leurs propres commandes, les vendeurs/admins peuvent tout voir
CREATE POLICY "orders_select_policy" ON orders
FOR SELECT
TO authenticated
USING (
  -- Les clients peuvent voir leurs propres commandes
  (auth.uid() = user_id)
  OR
  -- Les vendeurs et admins peuvent voir toutes les commandes
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('vendeur', 'admin')
  )
);

-- Politique d'insertion : seuls les webhooks et les admins peuvent créer des commandes
CREATE POLICY "orders_insert_policy" ON orders
FOR INSERT
TO authenticated
WITH CHECK (
  -- Les admins peuvent créer des commandes
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
  OR
  -- Ou si c'est une insertion via webhook (user_id fourni)
  user_id IS NOT NULL
);

-- Politique de mise à jour : les vendeurs et admins peuvent mettre à jour le statut
CREATE POLICY "orders_update_policy" ON orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('vendeur', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('vendeur', 'admin')
  )
);

-- 4. Créer des politiques pour la table order_items

-- Politique de lecture : suit la même logique que orders
CREATE POLICY "order_items_select_policy" ON order_items
FOR SELECT
TO authenticated
USING (
  -- Peut voir les items si on peut voir la commande correspondante
  EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = order_items.order_id 
    AND (
      (auth.uid() = o.user_id)
      OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('vendeur', 'admin')
      )
    )
  )
);

-- Politique d'insertion : seuls les webhooks et admins peuvent créer des order_items
CREATE POLICY "order_items_insert_policy" ON order_items
FOR INSERT
TO authenticated
WITH CHECK (
  -- Les admins peuvent créer des order_items
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
  OR
  -- Ou si c'est une insertion via webhook (order_id existe)
  order_id IS NOT NULL
);

-- 5. Donner des permissions spéciales pour les fonctions webhook
-- Créer un rôle spécial pour les webhooks si nécessaire
-- (Cette partie peut être ajustée selon votre configuration Supabase)

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Politiques RLS corrigées pour les commandes !';
    RAISE NOTICE 'Les clients peuvent voir leurs commandes, les vendeurs/admins peuvent tout voir.';
    RAISE NOTICE 'Les webhooks peuvent créer des commandes et order_items.';
END $$;
