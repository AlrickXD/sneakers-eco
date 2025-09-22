# Configuration de l'authentification Google

## 📋 Étapes de configuration

### 1. Google Cloud Console

#### Créer un projet
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez les APIs suivantes :
   - Google+ API (si disponible)
   - Google OAuth2 API

#### Configurer l'écran de consentement OAuth
1. Dans le menu : **APIs & Services** > **OAuth consent screen**
2. Choisir le type d'utilisateur : **External** (pour les utilisateurs publics)
3. Remplir les informations obligatoires :
   - **Nom de l'application** : `Père2Chaussures`
   - **Email de support utilisateur** : votre email
   - **Logo de l'application** : optionnel
   - **Domaine de l'application** : votre domaine (ex: `localhost:3000` pour le dev)
   - **Email de contact du développeur** : votre email

#### Créer les identifiants OAuth 2.0
1. Dans le menu : **APIs & Services** > **Credentials**
2. Cliquer sur **Create Credentials** > **OAuth 2.0 Client IDs**
3. Configurer :
   - **Type d'application** : `Web application`
   - **Nom** : `Père2Chaussures Web Client`
   - **URIs de redirection autorisés** :
     ```
     https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
     ```
     (Remplacez YOUR_SUPABASE_PROJECT_REF par votre référence de projet Supabase)

4. **Sauvegarder** et noter le **Client ID** et **Client Secret**

### 2. Configuration Supabase

#### Dans le Dashboard Supabase
1. Aller dans votre projet Supabase
2. **Authentication** > **Providers**
3. Trouver **Google** et l'activer
4. Remplir :
   - **Client ID** : celui de Google Cloud Console
   - **Client Secret** : celui de Google Cloud Console
5. **Save**

#### Configuration des URLs
1. **Authentication** > **URL Configuration**
2. Configurer :
   - **Site URL** : `http://localhost:3000` (dev) ou votre domaine de production
   - **Redirect URLs** : 
     ```
     http://localhost:3000/auth/callback
     https://yourdomain.com/auth/callback
     ```

### 3. Variables d'environnement

Créer/modifier `.env.local` :

```env
# Supabase (obligatoire)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google OAuth (optionnel - déjà configuré dans Supabase)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Admins (optionnel)
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

### 4. Test de la configuration

#### Vérifications avant test
1. ✅ Google Cloud Console configuré
2. ✅ Supabase Provider Google activé
3. ✅ URLs de redirection correctes
4. ✅ Variables d'environnement définies
5. ✅ Application redémarrée après modification des variables

#### Test en développement
1. Aller sur `http://localhost:3000/login`
2. Cliquer sur "Continuer avec Google"
3. Autoriser l'application Google
4. Vérifier la redirection vers `/auth/callback`
5. Vérifier la redirection finale selon le rôle utilisateur

## 🔧 Dépannage

### Erreur "redirect_uri_mismatch"
- Vérifier que l'URL de redirection dans Google Cloud Console correspond exactement à celle de Supabase
- Format : `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### Erreur "OAuth client not found"
- Vérifier que le Client ID dans Supabase correspond à celui de Google Cloud Console
- Vérifier que l'API Google OAuth2 est activée

### Utilisateur créé mais pas de profil
- Le système créera automatiquement un profil avec le rôle "client"
- Le nom d'affichage sera récupéré depuis Google (full_name ou name)

### Redirection incorrecte après connexion
- Vérifier la configuration des URLs dans Supabase
- Vérifier le code dans `/auth/callback/page.tsx`

## 📝 Notes importantes

1. **Sécurité** : Ne jamais exposer le Client Secret côté client
2. **Production** : Mettre à jour les URLs de redirection pour la production
3. **Domaines** : Ajouter votre domaine de production dans Google Cloud Console
4. **Roles** : Les nouveaux utilisateurs Google auront le rôle "client" par défaut
5. **Admin** : Configurer `NEXT_PUBLIC_ADMIN_EMAILS` pour promouvoir automatiquement des admins

## 🚀 Fonctionnalités implémentées

- ✅ Connexion Google sur la page login
- ✅ Inscription Google sur la page signup  
- ✅ Logo Google personnalisé (g.png)
- ✅ Création automatique de profil utilisateur
- ✅ Redirection selon le rôle (client/vendeur/admin)
- ✅ Gestion des erreurs OAuth
- ✅ États de chargement pendant l'authentification

