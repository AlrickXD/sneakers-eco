# Créer un Profil Vendeur - Guide Étape par Étape

## ❌ Problème Identifié
La table `profiles` n'a pas de colonne `email` directement. L'email est stocké dans `auth.users`.

## ✅ Solution Recommandée

### Méthode 1 : Via l'Interface Supabase (Plus Simple)

1. **Aller dans Supabase Dashboard**
   - Ouvrez votre projet Supabase
   - Allez dans `Authentication` > `Users`

2. **Créer un Nouvel Utilisateur**
   - Cliquez sur `Add user`
   - Email: `vendeur@test.com`
   - Password: `motdepasse123`
   - Cochez `Auto Confirm User` pour éviter la vérification email

3. **Modifier le Rôle**
   - Allez dans `Table Editor` > `profiles`
   - Trouvez l'utilisateur que vous venez de créer
   - Modifiez la colonne `role` de `client` à `vendeur`

### Méthode 2 : Via SQL (Après inscription normale)

1. **S'inscrire normalement sur le site**
   - Allez sur votre site web
   - Créez un compte avec :
     - Email: `vendeur@test.com`
     - Mot de passe: `motdepasse123`

2. **Changer le rôle via SQL**
   ```sql
   -- Exécuter dans Supabase SQL Editor
   UPDATE profiles 
   SET role = 'vendeur' 
   WHERE id = (
     SELECT id 
     FROM auth.users 
     WHERE email = 'vendeur@test.com'
   );
   ```

3. **Vérifier le changement**
   ```sql
   SELECT 
     u.email,
     p.role,
     p.created_at
   FROM auth.users u
   JOIN profiles p ON u.id = p.id
   WHERE u.email = 'vendeur@test.com';
   ```

## 🔑 Informations de Connexion

- **Email**: `vendeur@test.com`
- **Mot de passe**: `motdepasse123`
- **Rôle**: `vendeur`

## ✅ Vérification

Une fois connecté, vous devriez avoir accès à :
- Dashboard centralisé avec tous les produits
- Toutes les commandes de la plateforme
- Statistiques globales
- Gestion complète du catalogue

## 🔧 Dépannage

Si vous rencontrez des problèmes :
1. Utilisez `check-profiles-structure.sql` pour voir la vraie structure de votre table
2. Utilisez `create-seller-profile-fixed.sql` pour les requêtes adaptées
3. En cas de doute, utilisez la méthode via l'interface Supabase (plus fiable)
