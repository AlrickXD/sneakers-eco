-- =====================================================
-- AJOUT DU CHAMP NEEDS_LABEL POUR LA FONCTIONNALITÉ D'ÉTIQUETTE
-- =====================================================

-- 1. Ajouter le champ needs_label à la table orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS needs_label BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Créer un index pour optimiser les requêtes sur ce champ
CREATE INDEX IF NOT EXISTS idx_orders_needs_label ON orders(needs_label);

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Champ needs_label ajouté à la table orders !';
    RAISE NOTICE 'Ce champ permettra de savoir si une commande nécessite une étiquette d''envoi.';
END $$;
