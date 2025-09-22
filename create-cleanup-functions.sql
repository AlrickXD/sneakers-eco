-- =====================================================
-- FONCTIONS DE NETTOYAGE POUR L'INTERFACE ADMIN
-- =====================================================

-- 1. Fonction pour identifier les produits orphelins
CREATE OR REPLACE FUNCTION get_orphaned_products()
RETURNS TABLE(
  product_id TEXT,
  name TEXT,
  categorie TEXT,
  variant_count BIGINT,
  total_stock BIGINT,
  status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.product_id,
    p.name,
    p.categorie,
    COUNT(pv.sku)::BIGINT as variant_count,
    COALESCE(SUM(pv.stock), 0)::BIGINT as total_stock,
    CASE
      WHEN COUNT(pv.sku) = 0 THEN 'Aucune variante'
      WHEN COALESCE(SUM(pv.stock), 0) <= 0 THEN 'Rupture de stock'
      ELSE 'En stock'
    END as status
  FROM products p
  LEFT JOIN product_variants pv ON p.product_id = pv.product_id
  GROUP BY p.product_id, p.name, p.categorie
  HAVING COUNT(pv.sku) = 0 OR COALESCE(SUM(pv.stock), 0) <= 0
  ORDER BY p.product_id;
END;
$$;

-- 2. Fonction pour nettoyer les produits orphelins
CREATE OR REPLACE FUNCTION cleanup_orphaned_products()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Compter les produits qui seront supprimés
  SELECT COUNT(*) INTO deleted_count
  FROM products p
  LEFT JOIN product_variants pv ON p.product_id = pv.product_id
  WHERE pv.stock <= 0 OR pv.stock IS NULL;

  -- Supprimer les variantes en rupture de stock
  DELETE FROM product_variants
  WHERE stock <= 0;

  -- Supprimer les produits sans variantes
  DELETE FROM products
  WHERE product_id NOT IN (
    SELECT DISTINCT product_id
    FROM product_variants
    WHERE stock > 0
  );

  RETURN deleted_count;
END;
$$;

-- 3. Rendre les fonctions accessibles via RPC
GRANT EXECUTE ON FUNCTION get_orphaned_products() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_orphaned_products() TO authenticated;

-- 4. Test des fonctions
DO $$
DECLARE
  test_result INTEGER;
BEGIN
  -- Test de la fonction de comptage
  SELECT cleanup_orphaned_products() INTO test_result;
  RAISE NOTICE '✅ Fonctions créées avec succès. Produits nettoyés: %', test_result;
END $$;

-- =====================================================
-- INSTRUCTIONS :
-- 1. Copier ce contenu
-- 2. Aller dans Supabase Dashboard > SQL Editor
-- 3. Coller et exécuter cette requête
-- 4. Aller sur http://localhost:3000/admin/cleanup
-- 5. Utiliser l'interface pour nettoyer les produits
-- =====================================================
