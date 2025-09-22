# 🔍 Guide de Diagnostic - Informations de Livraison

## 🚨 Problème

Les informations de livraison ne s'affichent pas sur la page vendeur malgré l'implémentation.

## 📋 Étapes de Diagnostic

### Étape 1 : Vérifier la Base de Données
**Exécutez dans Supabase SQL Editor :**
```sql
debug-shipping-info.sql
```

**Résultats attendus :**
- ✅ Les 6 colonnes de livraison existent
- ✅ Au moins une commande récente avec des données de livraison

### Étape 2 : Vérifier les Logs Webhook
**Après avoir passé une nouvelle commande, vérifiez les logs :**

1. **Ouvrez la console serveur** (terminal où `npm run dev`)
2. **Cherchez ces logs :**

```
=== SESSION COMPLETE DEBUG ===
Session keys: [...]
Session customer_details: {...}

=== SHIPPING DEBUG ===
Session shipping_details: {...}
Customer details: {...}
Final shipping info: {...}

📦 Paramètres de livraison envoyés à la fonction: {...}
```

### Étape 3 : Tests Spécifiques

#### Test A : Commande avec Adresse de Livraison
1. Allez sur http://localhost:3001/cart
2. Passez une commande
3. **IMPORTANT** : Dans Stripe Checkout, remplissez bien l'adresse de livraison
4. Vérifiez les logs webhook

#### Test B : Vérification Directe Base de Données
```sql
-- Voir la dernière commande créée
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;
```

## 🔍 Causes Possibles

### Cause 1 : Colonnes Manquantes
**Symptôme :** `debug-shipping-info.sql` ne montre pas les 6 colonnes
**Solution :** Ré-exécuter `add-shipping-info.sql`

### Cause 2 : Stripe ne Fournit Pas les Données
**Symptôme :** Logs montrent `shipping_details: null` et `customer_details: null`
**Cause :** Configuration Stripe ou données non collectées

### Cause 3 : Fonction Base de Données Échoue
**Symptôme :** Logs montrent une erreur dans `create_order_from_webhook`
**Solution :** Vérifier que la fonction accepte les nouveaux paramètres

### Cause 4 : Webhook Utilise Fallback
**Symptôme :** Logs montrent "Tentative méthode manuelle"
**Action :** Vérifier que le fallback inclut aussi les données de livraison

## 🛠️ Solutions par Problème

### Si Colonnes Manquantes
```sql
-- Ré-exécuter
add-shipping-info.sql
```

### Si Données Stripe Manquantes
Vérifiez dans les logs webhook :
- `Session shipping_details`
- `Session customer_details`
- `Final shipping info`

### Si Fonction Échoue
```sql
-- Vérifier que la fonction existe avec les bons paramètres
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'create_order_from_webhook';
```

## 🧪 Test de Validation

### Test Complet
1. **Base de données** : `debug-shipping-info.sql` ✅
2. **Nouvelle commande** avec adresse complète ✅
3. **Logs webhook** détaillés ✅
4. **Page vendeur** affiche les informations ✅

### Commande de Test SQL
```sql
-- Insérer manuellement une commande de test avec adresse
INSERT INTO orders (
  user_id, 
  status, 
  total_eur, 
  shipping_name,
  shipping_address_line1,
  shipping_city,
  shipping_country
) VALUES (
  'user-id-test',
  'paid',
  100.00,
  'Jean Dupont Test',
  '123 Rue de Test',
  'Paris',
  'France'
);
```

## 📊 Logs à Surveiller

**Logs Normaux :**
```
Final shipping info: {
  name: "Jean Dupont",
  address: {
    line1: "123 Rue de la Paix",
    city: "Paris",
    country: "FR"
  }
}

📦 Paramètres de livraison envoyés à la fonction: {
  p_shipping_name: "Jean Dupont",
  p_shipping_address_line1: "123 Rue de la Paix",
  p_shipping_city: "Paris",
  p_shipping_country: "FR"
}
```

**Logs Problématiques :**
```
Final shipping info: null
📦 Paramètres de livraison envoyés à la fonction: {
  p_shipping_name: null,
  p_shipping_address_line1: null,
  ...
}
```

## 🎯 Prochaines Étapes

1. **Exécutez `debug-shipping-info.sql`** d'abord
2. **Passez une nouvelle commande** avec adresse complète
3. **Vérifiez les logs** webhook dans le terminal
4. **Partagez les résultats** pour diagnostic plus poussé

Les logs détaillés nous diront exactement où est le problème ! 🔍
