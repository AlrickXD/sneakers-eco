# 📦 Test des Informations de Livraison - Étapes

## ✅ Base de Données Confirmée

Les colonnes de livraison existent bien dans la table `orders` :
- `shipping_name` ✅
- `shipping_address_line1` ✅
- `shipping_address_line2` ✅
- `shipping_city` ✅
- `shipping_postal_code` ✅
- `shipping_country` ✅

## 🧪 Tests à Effectuer

### Test 1 : Vérifier les Commandes Existantes
**Exécutez :**
```sql
check-existing-orders.sql
```

**Si aucune commande n'a d'infos de livraison :**
→ Le problème vient du webhook qui ne récupère pas les données

**Si certaines commandes ont des infos :**
→ Le problème vient de l'affichage sur la page vendeur

### Test 2 : Test Manuel d'Affichage
**Exécutez :**
```sql
test-shipping-manual.sql
```

**Puis allez sur :**
http://localhost:3001/seller/orders

**Vous devriez voir :**
```
📍 Adresse de livraison
Jean Dupont Test
123 Rue de la Paix
Appartement 4B
75001 Paris
France
```

**Si vous voyez cette section :**
→ L'affichage fonctionne, le problème vient du webhook

**Si vous ne voyez pas cette section :**
→ Problème dans l'affichage de la page vendeur

### Test 3 : Nouvelle Commande avec Logs
**Étapes :**
1. Ouvrez votre terminal où `npm run dev` fonctionne
2. Passez une nouvelle commande sur http://localhost:3001/cart
3. **IMPORTANT** : Remplissez bien l'adresse dans Stripe Checkout
4. Regardez les logs dans le terminal

**Logs à chercher :**
```
=== SESSION COMPLETE DEBUG ===
Session keys: [...]
Session customer_details: {...}

=== SHIPPING DEBUG ===
Final shipping info: {...}
Final name: "..."
Final address: {...}

📦 Paramètres de livraison envoyés à la fonction: {...}
```

## 🔍 Diagnostic par Résultats

### Cas A : Test Manuel Fonctionne
**Symptôme :** La commande de test s'affiche avec l'adresse
**Conclusion :** L'affichage fonctionne, le webhook ne récupère pas les données
**Action :** Analyser les logs de la nouvelle commande

### Cas B : Test Manuel Échoue
**Symptôme :** La commande de test ne montre pas l'adresse
**Conclusion :** Problème dans l'affichage de la page vendeur
**Action :** Vérifier le code de `src/app/seller/orders/page.tsx`

### Cas C : Logs Montrent `null`
**Symptôme :** `Final shipping info: null` dans les logs
**Conclusion :** Stripe ne fournit pas les données ou mauvais champ
**Action :** Vérifier la configuration Stripe Checkout

### Cas D : Logs Montrent des Données
**Symptôme :** `Final name: "Jean Dupont"` mais pas en base
**Conclusion :** Fonction de base de données échoue
**Action :** Vérifier la fonction `create_order_from_webhook`

## 📋 Actions par Problème

### Si Webhook ne Récupère Pas
```javascript
// Dans src/app/api/stripe/webhook/route.ts
// Vérifier que billing_address_collection fonctionne
console.log('Session customer_details:', session.customer_details)
```

### Si Fonction Base de Données Échoue
```sql
-- Tester la fonction directement
SELECT create_order_from_webhook(
  'user-id'::uuid,
  100.00,
  '[{"sku":"test","quantity":1}]'::jsonb,
  'cs_test_manual',
  false,
  'Test Name',
  'Test Address',
  null,
  'Test City',
  '12345',
  'France'
);
```

### Si Affichage Échoue
Vérifier dans `src/app/seller/orders/page.tsx` :
```javascript
{(order.shipping_name || order.shipping_address_line1) && (
  // Section d'affichage
)}
```

## 🎯 Prochaines Étapes

1. **Exécutez `check-existing-orders.sql`** pour voir l'état actuel
2. **Exécutez `test-shipping-manual.sql`** pour tester l'affichage
3. **Passez une nouvelle commande** et regardez les logs
4. **Partagez les résultats** pour diagnostic précis

Les tests nous diront exactement où est le problème ! 🔍
