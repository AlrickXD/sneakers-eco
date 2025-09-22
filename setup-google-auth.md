# 🔐 Configuration Google OAuth pour Supabase

## 📋 Étapes de configuration

### 1. Configurer Google Cloud Console
1. **Aller sur** : https://console.cloud.google.com/
2. **Créer un projet** ou sélectionner un projet existant
3. **Activer l'API** : Google+ API et Google Identity
4. **Créer des identifiants** :
   - Type : ID client OAuth 2.0
   - Type d'application : Application Web

### 2. Configurer les URLs autorisées
Dans Google Cloud Console > Identifiants :

**JavaScript origins autorisées :**
```
http://localhost:3000
https://votre-domaine.com
```

**URI de redirection autorisées :**
```
https://[votre-projet-supabase].supabase.co/auth/v1/callback
```

### 3. Configurer Supabase Dashboard
1. **Aller sur** : https://supabase.com/dashboard
2. **Projet** > Authentication > Providers
3. **Google** : Activer le provider
4. **Client ID** : Copier depuis Google Cloud Console
5. **Client Secret** : Copier depuis Google Cloud Console

### 4. Variables d'environnement (optionnel)
Dans `.env.local` :
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## ✅ Fonctionnalités ajoutées

### 🎨 Interface de connexion améliorée
- **Icônes** : Mail et Lock dans les champs
- **Bouton Google** : Design moderne avec icône Chrome
- **Séparateur** : "Ou" entre les méthodes
- **Case "Rester connecté"** : Avec persistance locale

### 🔧 Fonctionnalités techniques
- **OAuth Google** : Intégration Supabase native
- **Persistance session** : Configuration selon "Rester connecté"
- **Redirection** : Retour automatique vers la page d'origine
- **Gestion d'erreurs** : Messages clairs pour chaque méthode

### 🎯 Test de l'authentification
1. **Connexion email/mot de passe** : Avec ou sans "Rester connecté"
2. **Connexion Google** : Redirection OAuth automatique
3. **Persistance** : Vérifier que la session persiste selon l'option choisie

## 🚨 Notes importantes
- **Google OAuth** nécessite une configuration côté Google Cloud Console
- **HTTPS requis** en production pour Google OAuth
- **Domaines autorisés** doivent être configurés des deux côtés (Google + Supabase)


