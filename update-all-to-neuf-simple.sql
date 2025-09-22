-- =====================================================
-- MISE À JOUR SIMPLE : TOUS LES PRODUITS EN NEUF
-- =====================================================

-- Requête simple pour mettre à jour tous les produits en NEUF
UPDATE product_variants
SET etat = 'NEUF'
WHERE etat IS NOT NULL;

-- =====================================================
-- NOTES :
-- - Met à jour TOUS les produits (stock > 0 et stock <= 0)
-- - Simple et direct
-- =====================================================
