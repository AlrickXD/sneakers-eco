# Guide de Correction - Problèmes d'Ajout de Produit Vendeur

## 🎯 Objectif

Ce guide vous aide à diagnostiquer et corriger les erreurs qui surviennent lorsqu'un vendeur essaie d'ajouter un produit via le formulaire.

## 📋 Scripts Créés

### 1. `debug-seller-product-creation.sql`
**Objectif** : Diagnostic complet de la base de données
**Usage** : À exécuter dans Supabase SQL Editor

### 2. `fix-seller-product-creation.sql`
**Objectif** : Correction automatique des problèmes identifiés
**Usage** : À exécuter dans Supabase SQL Editor après le diagnostic

### 3. `debug-frontend-errors.js`
**Objectif** : Diagnostic côté frontend dans le navigateur
**Usage** : À copier-coller dans la console du navigateur

## 🔍 Étapes de Diagnostic

### Étape 1 : Diagnostic Base de Données

1. **Ouvrir Supabase Dashboard**
   - Aller dans votre projet Supabase
   - Cliquer sur "SQL Editor"

2. **Exécuter le script de diagnostic**
   ```sql
   -- Copier le contenu de debug-seller-product-creation.sql
   -- et l'exécuter dans SQL Editor
   ```

3. **Analyser les résultats**
   - ✅ **Vert** : Tout fonctionne
   - ❌ **Rouge** : Problème identifié
   - ⚠️ **Orange** : Avertissement

### Étape 2 : Diagnostic Frontend

1. **Ouvrir la page d'ajout de produit**
   - Se connecter en tant que vendeur
   - Aller sur `/seller/products/add`

2. **Ouvrir la console du navigateur**
   - F12 ou Ctrl+Shift+I (Windows/Linux)
   - Cmd+Option+I (Mac)

3. **Exécuter le script de diagnostic**
   ```javascript
   // Copier le contenu de debug-frontend-errors.js
   // et l'exécuter dans la console
   ```

4. **Analyser les résultats**
   - Le script teste automatiquement toutes les fonctionnalités
   - Les erreurs sont loggées avec des détails

## 🔧 Correction des Problèmes

### Problèmes Courants et Solutions

#### 1. **Erreur RLS (Row Level Security)**
```
Error: new row violates row-level security policy
```

**Solution** :
- Exécuter `fix-seller-product-creation.sql`
- Ce script recrée toutes les politiques RLS correctement

#### 2. **Erreur de Permissions**
```
Error: permission denied for table products
```

**Solution** :
- Le script de correction accorde les bonnes permissions
- Vérifier que l'utilisateur a le rôle "vendeur"

#### 3. **Erreur de Contrainte**
```
Error: violates foreign key constraint
```

**Solution** :
- Vérifier que le `seller_id` correspond à un utilisateur existant
- Le script de correction recrée les contraintes correctement

#### 4. **Erreur d'Upload d'Images**
```
Error: The resource was not found
```

**Solution** :
- Le script de correction configure le bucket `product-images`
- Vérifie les politiques de storage

### Correction Automatique

1. **Exécuter le script de correction**
   ```sql
   -- Dans Supabase SQL Editor
   -- Copier le contenu de fix-seller-product-creation.sql
   ```

2. **Vérifier les résultats**
   - Le script affiche "SUCCESS" si tout fonctionne
   - Sinon, il indique les erreurs restantes

## 🧪 Test Après Correction

### Test Base de Données
Le script de correction inclut un test automatique qui :
- Crée un utilisateur vendeur temporaire
- Teste l'insertion d'un produit
- Teste l'insertion d'une variante
- Nettoie les données de test

### Test Frontend
1. **Se connecter en tant que vendeur**
2. **Aller sur la page d'ajout de produit**
3. **Remplir le formulaire avec des données de test** :
   ```
   SKU: TEST-NIKE-AF1-001
   Nom: Nike Air Force 1 Test
   Marque: Nike
   Catégorie: Homme
   Description: Chaussure de test
   Couleur: BLANC
   Taille: 42
   Prix: 99.99
   Stock: 1
   ```
4. **Soumettre le formulaire**
5. **Vérifier dans la console** :
   - Aucune erreur rouge
   - Message de succès
   - Redirection vers le dashboard vendeur

## 📊 Monitoring Continu

### Variables à Surveiller

1. **Politiques RLS** : Vérifier qu'elles sont actives
2. **Permissions** : S'assurer que `authenticated` a les bonnes permissions
3. **Contraintes** : Vérifier l'intégrité des clés étrangères
4. **Storage** : S'assurer que le bucket `product-images` est public

### Script de Vérification Rapide

```sql
-- À exécuter périodiquement dans Supabase
SELECT 
  'products' as table_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN seller_id IS NULL THEN 1 END) as rows_without_seller
FROM products
UNION ALL
SELECT 
  'product_variants',
  COUNT(*),
  COUNT(CASE WHEN seller_id IS NULL THEN 1 END)
FROM product_variants;
```

## 🚨 Problèmes Spécifiques

### Interface ProductVariant Manquante

Si vous voyez une erreur concernant l'interface `ProductVariant`, c'est que le formulaire utilise une interface locale qui ne correspond pas à celle de `database.ts`.

**Correction dans le code** :
```typescript
// Dans src/app/seller/products/add/page.tsx
// Remplacer l'interface locale par celle importée
import { ProductVariant } from '@/types/database'

// Supprimer la définition locale :
// interface ProductVariant { ... }
```

### Problème de Taille (string vs number)

Le formulaire peut avoir un problème de type pour la taille.

**Vérification** :
```typescript
// S'assurer que taille est bien un number
updateVariant(index, 'taille', parseInt(e.target.value || '40'))
```

## 📞 Support

Si les scripts ne résolvent pas votre problème :

1. **Copier les logs d'erreur** de la console
2. **Copier les résultats** du script de diagnostic
3. **Vérifier les variables d'environnement** Supabase
4. **Tester avec un autre compte vendeur**

## ✅ Checklist de Vérification

- [ ] Script de diagnostic exécuté sans erreur
- [ ] Politiques RLS créées et actives
- [ ] Permissions accordées à `authenticated`
- [ ] Bucket `product-images` configuré
- [ ] Test d'insertion réussi
- [ ] Interface utilisateur fonctionnelle
- [ ] Upload d'images opérationnel
- [ ] Redirection après création

---

**Note** : Ces scripts sont sûrs et incluent des tests automatiques. Ils ne modifient que les permissions et politiques, pas les données existantes.
