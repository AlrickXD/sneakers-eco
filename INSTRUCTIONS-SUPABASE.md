# Instructions Supabase - Section par section

## Étapes à suivre dans Supabase SQL Editor :

### 1. Section 1 : Vérifier l'utilisateur
```sql
-- section-1-user.sql
SELECT
  '=== UTILISATEUR CONNECTÉ ===' as section,
  auth.uid() as user_id,
  CASE WHEN auth.uid() IS NOT NULL THEN 'AUTHENTIFIÉ' ELSE 'NON AUTHENTIFIÉ' END as status;
```
**Résultat attendu :** Vous devriez voir votre ID utilisateur et "AUTHENTIFIÉ"

### 2. Section 2 : Compter les produits
```sql
-- section-2-products.sql
SELECT
  '=== PRODUITS ===' as section,
  COUNT(*) as total_produits
FROM products;
```

### 3. Section 3 : Compter les variantes
```sql
-- section-3-variants.sql
SELECT
  '=== VARIANTES ===' as section,
  COUNT(*) as total_variantes
FROM product_variants;
```

### 4. Section 4 : Vérifier les politiques
```sql
-- section-4-policies.sql
SELECT
  '=== POLITIQUES RLS ===' as section,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('products', 'product_variants')
ORDER BY tablename, policyname;
```

### 5. Section 5 : Tester l'insertion
```sql
-- section-5-test-insertion.sql
DO $$
DECLARE
  test_product_id TEXT := 'TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  test_sku TEXT := 'SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
  INSERT INTO products (product_id, name, categorie, seller_id)
  VALUES (test_product_id, 'Test Product', 'Homme', auth.uid());

  INSERT INTO product_variants (
    sku, product_id, name, etat, taille, categorie, prix_eur, stock, seller_id
  ) VALUES (
    test_sku, test_product_id, 'Test Variant', 'NEUF', 40, 'Homme', 100.00, 1, auth.uid()
  );

  RAISE NOTICE '✅ Test d''insertion réussi';

  DELETE FROM product_variants WHERE product_id = test_product_id;
  DELETE FROM products WHERE product_id = test_product_id;
END;
$$;
```

### 6. Section 6 : Corriger les politiques
```sql
-- section-6-fix-policies.sql
DROP POLICY IF EXISTS "products_insert_policy" ON products;
DROP POLICY IF EXISTS "products_update_policy" ON products;
DROP POLICY IF EXISTS "variants_insert_policy" ON product_variants;
DROP POLICY IF EXISTS "variants_update_policy" ON product_variants;
DROP POLICY IF EXISTS "Enable insert for sellers" ON products;
DROP POLICY IF EXISTS "Enable insert for sellers" ON product_variants;
DROP POLICY IF EXISTS "Products insert for authenticated" ON products;
DROP POLICY IF EXISTS "Product variants insert for authenticated" ON product_variants;
DROP POLICY IF EXISTS "Allow all on products" ON products;
DROP POLICY IF EXISTS "Allow all on product_variants" ON products;
DROP POLICY IF EXISTS "ultimate_debug_products" ON products;
DROP POLICY IF EXISTS "ultimate_debug_variants" ON product_variants;
DROP POLICY IF EXISTS "temp_products_all" ON products;
DROP POLICY IF EXISTS "temp_variants_all" ON product_variants;
DROP POLICY IF EXISTS "products_allow_all" ON products;
DROP POLICY IF EXISTS "variants_allow_all" ON product_variants;

CREATE POLICY "fix_products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "fix_variants" ON product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

### 7. Section 7 : Vérifier la correction
```sql
-- section-7-verify.sql
SELECT
  '=== POLITIQUE FINALE ===' as section,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename IN ('products', 'product_variants');

DO $$
DECLARE
  test_product_id TEXT := 'FINAL-TEST-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  test_sku TEXT := 'FINAL-SKU-' || EXTRACT(EPOCH FROM NOW())::TEXT;
BEGIN
  INSERT INTO products (product_id, name, categorie, seller_id)
  VALUES (test_product_id, 'Final Test', 'Homme', auth.uid());

  INSERT INTO product_variants (
    sku, product_id, name, etat, taille, categorie, prix_eur, stock, seller_id
  ) VALUES (
    test_sku, test_product_id, 'Final Test Variant', 'NEUF', 40, 'Homme', 100.00, 1, auth.uid()
  );

  RAISE NOTICE '✅ Test final réussi';

  DELETE FROM product_variants WHERE product_id = test_product_id;
  DELETE FROM products WHERE product_id = test_product_id;
END;
$$;
```

## Comment exécuter :

1. Ouvrez Supabase SQL Editor
2. Connectez-vous avec votre compte vendeur
3. Copiez le contenu de chaque section
4. Collez dans Supabase
5. Cliquez sur "Run"
6. Notez les résultats
7. Passez à la section suivante

## Test final :

Après toutes les sections, testez l'ajout de produit sur :
`http://localhost:3000/seller/products/add`
