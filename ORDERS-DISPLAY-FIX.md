# 🔧 Correction du Problème d'Affichage des Commandes

## 🚨 Problème Identifié

Les commandes ne s'affichent plus côté client et vendeur après l'ajout du champ `needs_label`. Cela est probablement dû à :

1. **Problèmes de politiques RLS** (Row Level Security)
2. **Permissions manquantes** pour les webhooks
3. **Champ `needs_label` non reconnu** par les anciennes politiques

## 🛠️ Solution Étape par Étape

### 1. Diagnostic Initial
Exécutez d'abord ce fichier pour identifier le problème :
```sql
debug-orders-visibility.sql
```

### 2. Correction des Politiques RLS
Exécutez ce fichier pour corriger les politiques de sécurité :
```sql
fix-orders-policies.sql
```

### 3. Correction des Permissions Webhook
Exécutez ce fichier pour permettre aux webhooks de créer des commandes :
```sql
fix-webhook-permissions.sql
```

### 4. Mise à Jour du Schéma
Si pas encore fait, ajoutez le champ `needs_label` :
```sql
add-label-requirement.sql
```

### 5. Mise à Jour de la Fonction Webhook
Mettez à jour la fonction pour supporter le nouveau champ :
```sql
update-create-order-function.sql
```

## 🔍 Vérifications à Effectuer

### Dans Supabase SQL Editor :

1. **Vérifier les commandes existantes :**
```sql
SELECT COUNT(*) FROM orders;
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;
```

2. **Vérifier les politiques RLS :**
```sql
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

3. **Tester une requête client :**
```sql
-- Remplacez 'USER_ID_HERE' par un vrai ID utilisateur
SELECT * FROM orders WHERE user_id = 'USER_ID_HERE';
```

### Dans l'Application :

1. **Console du navigateur :** Vérifiez s'il y a des erreurs JavaScript
2. **Onglet Network :** Vérifiez si les requêtes vers Supabase échouent
3. **Page Account (/account) :** Testez l'affichage des commandes client
4. **Page Seller Orders (/seller/orders) :** Testez l'affichage côté vendeur

## 🚀 Si le Problème Persiste

### Option 1 : Désactiver Temporairement RLS
```sql
-- ATTENTION : À utiliser uniquement pour le debug
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
```

### Option 2 : Politique Ultra-Permissive (Temporaire)
```sql
-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "orders_select_policy" ON orders;

-- Créer une politique qui permet tout (TEMPORAIRE)
CREATE POLICY "orders_allow_all" ON orders
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

### Option 3 : Vérifier les Rôles Utilisateur
```sql
-- Vérifier que les profils utilisateur ont bien des rôles
SELECT id, role, display_name FROM profiles LIMIT 10;
```

## 📱 Test de la Fonctionnalité

### Test Client :
1. Se connecter en tant que client
2. Aller sur `/account`
3. Vérifier que les commandes s'affichent
4. Passer une nouvelle commande avec la case "étiquette" cochée

### Test Vendeur :
1. Se connecter en tant que vendeur
2. Aller sur `/seller/orders`
3. Vérifier que toutes les commandes s'affichent
4. Vérifier que l'indication "📦 Envoyez une étiquette" apparaît pour les commandes concernées

### Test Admin :
1. Se connecter en tant qu'admin
2. Aller sur `/admin/orders`
3. Vérifier que toutes les commandes sont visibles

## 🎯 Ordre d'Exécution Recommandé

1. `debug-orders-visibility.sql` - Diagnostic
2. `add-label-requirement.sql` - Ajouter le champ (si pas fait)
3. `fix-orders-policies.sql` - Corriger les politiques
4. `fix-webhook-permissions.sql` - Corriger les webhooks
5. `update-create-order-function.sql` - Mettre à jour la fonction

## ✅ Validation Finale

Une fois les corrections appliquées :

- [ ] Les clients voient leurs commandes sur `/account`
- [ ] Les vendeurs voient toutes les commandes sur `/seller/orders`
- [ ] Les admins voient toutes les commandes sur `/admin/orders`
- [ ] Les nouvelles commandes avec étiquette s'affichent correctement
- [ ] L'indication "📦 Envoyez une étiquette" apparaît quand nécessaire

## 🆘 Support d'Urgence

Si rien ne fonctionne, contactez-moi avec :
1. Les messages d'erreur dans la console
2. Le résultat du diagnostic SQL
3. Une capture d'écran des pages qui ne fonctionnent pas

La fonctionnalité sera restaurée ! 🚀
