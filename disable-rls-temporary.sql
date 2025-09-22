-- =====================================================
-- DÉSACTIVATION TEMPORAIRE DE RLS
-- ATTENTION : À utiliser UNIQUEMENT en cas d'urgence
-- =====================================================

-- ATTENTION : Cette solution désactive la sécurité RLS
-- À utiliser SEULEMENT si emergency-rls-fix.sql ne fonctionne pas
-- Et SEULEMENT temporairement pour identifier le problème

-- 1. Désactiver RLS temporairement
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- 2. Message d'avertissement
DO $$
BEGIN
    RAISE NOTICE '⚠️  AVERTISSEMENT : RLS DÉSACTIVÉ !';
    RAISE NOTICE 'Les tables orders et order_items n''ont plus de sécurité au niveau des lignes.';
    RAISE NOTICE 'Ceci est TEMPORAIRE pour identifier le problème.';
    RAISE NOTICE 'RÉACTIVEZ RLS dès que possible avec emergency-rls-fix.sql';
END $$;

-- 3. Script pour réactiver (à exécuter dès que possible)
/*
-- POUR RÉACTIVER RLS :
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Puis exécuter emergency-rls-fix.sql pour les bonnes politiques
*/
