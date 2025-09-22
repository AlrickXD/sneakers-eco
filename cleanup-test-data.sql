-- =====================================================
-- NETTOYAGE : Supprimer les données de test
-- =====================================================

-- Supprimer les produits de test
DELETE FROM product_variants WHERE product_id LIKE 'TEST-%';
DELETE FROM products WHERE product_id LIKE 'TEST-%';

-- Vérifier qu'il ne reste plus de données de test
SELECT
  'products' as table_name,
  COUNT(*) as test_count
FROM products
WHERE product_id LIKE 'TEST-%'
UNION ALL
SELECT
  'product_variants' as table_name,
  COUNT(*) as test_count
FROM product_variants
WHERE product_id LIKE 'TEST-%';

-- =====================================================
-- NOTES :
-- - Supprime toutes les données de test
-- - Vérifie qu'il ne reste rien
-- =====================================================
