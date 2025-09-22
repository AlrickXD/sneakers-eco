# 🔧 Plan de Correction - Email Client

## 🔍 Diagnostic du Problème

Vous mentionnez que :
1. ❌ L'email ne s'affiche pas dans l'interface
2. ❌ La colonne `customer_email` n'existe pas dans la table `orders`

## 📋 Plan d'Action Étape par Étape

### **Étape 1 : Diagnostic Complet**
Exécutez ce script pour identifier exactement ce qui manque :
```sql
-- Contenu du fichier debug-email-issue.sql
```

### **Étape 2 : Ajouter la Colonne Email**
Exécutez ce script pour ajouter la colonne manquante :
```sql
-- Contenu du fichier add-email-column-simple.sql
```

### **Étape 3 : Vérifier/Corriger la Fonction**
Si la fonction `create_order_from_webhook` n'a pas le paramètre email :
```sql
-- Contenu du fichier fix-duplicate-function.sql
```

### **Étape 4 : Test Complet**
1. Passer une nouvelle commande test
2. Vérifier les logs du webhook
3. Vérifier la base de données
4. Vérifier l'interface vendeur

## 🎯 Scripts Disponibles

### **Option A : Diagnostic Seulement**
```bash
# Exécuter debug-email-issue.sql
# Pour identifier ce qui manque exactement
```

### **Option B : Correction Minimale**
```bash
# 1. Exécuter add-email-column-simple.sql
# 2. Tester avec une nouvelle commande
```

### **Option C : Correction Complète**
```bash
# 1. Exécuter add-email-column-simple.sql
# 2. Exécuter fix-duplicate-function.sql
# 3. Tester avec une nouvelle commande
```

## 🔍 Points de Vérification

### **Base de Données**
- [ ] Colonne `customer_email` existe dans `orders`
- [ ] Fonction `create_order_from_webhook` a le paramètre `p_customer_email`
- [ ] Nouvelles commandes ont `customer_email` rempli

### **Code**
- [x] Webhook récupère `customerDetails?.email` ✅
- [x] Webhook passe `p_customer_email` à la fonction ✅
- [x] Interface affiche `order.customer_email` ✅

### **Test**
- [ ] Passer une commande test
- [ ] Vérifier les logs webhook (email récupéré ?)
- [ ] Vérifier en base (`customer_email` rempli ?)
- [ ] Vérifier interface (email affiché ?)

## 🚨 Problème le Plus Probable

Le problème est probablement que :
1. **La colonne `customer_email` n'existe pas** dans votre table `orders`
2. **OU** la fonction `create_order_from_webhook` n'a pas été mise à jour pour accepter le paramètre `p_customer_email`

## 🎯 Solution Rapide

**Commencez par l'Étape 1 (diagnostic)** pour identifier exactement ce qui manque, puis appliquez la correction appropriée.

---

**Note** : Les scripts sont conçus pour être sûrs et ne cassent rien d'existant. Ils ajoutent seulement ce qui manque.
