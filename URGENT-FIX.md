# 🚨 CORRECTION URGENTE - Récursion infinie RLS

## Problème identifié
```
Erreur table profiles: infinite recursion detected in policy for relation "profiles"
```

Cette erreur se produit quand les policies RLS font référence à elles-mêmes, créant une boucle infinie.

## ✅ Solution rapide (2 options)

### Option 1: Policies simplifiées (RECOMMANDÉE)

Exécutez ce script dans Supabase SQL Editor :

```sql
-- Copier le contenu de simple-policies.sql
```

Cette option :
- ✅ Supprime la récursion
- ✅ Garde la sécurité de base
- ✅ Gère les rôles côté application
- ✅ Fonctionne immédiatement

### Option 2: Corriger les policies complexes

1. Exécutez d'abord `fix-policies.sql` pour nettoyer
2. Puis exécutez `supabase.sql` (version corrigée)

## 🔧 Étapes à suivre MAINTENANT

### 1. Aller sur Supabase Dashboard
- Ouvrir [Supabase Dashboard](https://supabase.com/dashboard)
- Aller dans SQL Editor

### 2. Exécuter le script de correction
```sql
-- COPIER LE CONTENU DE simple-policies.sql ICI
-- ET CLIQUER SUR "RUN"
```

### 3. Vérifier que ça fonctionne
- Retourner sur l'application
- Rafraîchir la page
- L'erreur devrait disparaître

### 4. Ajouter des données de test (optionnel)
```sql
-- COPIER LE CONTENU DE test-data.sql ICI
-- ET CLIQUER SUR "RUN"
```

## 🎯 Après la correction

L'application devrait :
- ✅ Se charger sans erreur de récursion
- ✅ Permettre l'inscription/connexion
- ✅ Créer automatiquement les profils
- ✅ Afficher les produits s'ils existent

## 🆘 Si ça ne fonctionne toujours pas

1. **Vérifier les variables d'environnement** :
   - `NEXT_PUBLIC_SUPABASE_URL` correct
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` correct
   - `SUPABASE_SERVICE_ROLE_KEY` définie

2. **Vérifier la connexion Supabase** :
   - Dashboard accessible
   - Projet actif
   - Pas d'erreur de quota

3. **Redémarrer l'application** :
   ```bash
   # Arrêter avec Ctrl+C puis relancer
   npm run dev
   ```

---

**⚡ PRIORITÉ: Exécuter simple-policies.sql MAINTENANT pour corriger l'erreur !**


