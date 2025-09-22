# 🛡️ Système d'Administration - Sneakers-Eco

## Vue d'ensemble

Le système d'administration de Sneakers-Eco offre un contrôle complet sur la plateforme avec des fonctionnalités avancées de gestion des utilisateurs, produits, commandes et analytics.

## 🔑 Identifiants Admin par défaut

**Email :** `admin@sneakers-eco.com`  
**Mot de passe :** `AdminSecure2024!`  
**Rôle :** `admin`

## 📋 Installation et Configuration

### 1. Créer l'utilisateur admin

Exécutez le script SQL suivant dans Supabase :

```bash
# Dans Supabase SQL Editor
\i create-admin-user.sql
```

### 2. Vérifier les politiques RLS

Assurez-vous que les politiques de sécurité sont correctement configurées pour permettre aux admins d'accéder à toutes les données.

## 🎯 Fonctionnalités Principales

### 📊 Dashboard Principal (`/admin`)
- **Statistiques en temps réel** : Utilisateurs, produits, commandes, revenus
- **Alertes** : Commandes en attente, stocks faibles
- **Actions rapides** : Accès direct aux différentes sections
- **Informations système** : État de la plateforme

### 👥 Gestion des Utilisateurs (`/admin/users`)
- **Vue d'ensemble** : Liste complète des utilisateurs avec filtres
- **Gestion des rôles** : Changer les rôles (client → vendeur → admin)
- **Suppression** : Supprimer les utilisateurs (sauf admins)
- **Recherche avancée** : Par email, nom, rôle
- **Statistiques** : Répartition par rôles

### 📦 Gestion des Produits (`/admin/products`)
- **Catalogue complet** : Tous les produits de tous les vendeurs
- **Informations détaillées** : Prix, stock, état, vendeur
- **Actions** : Voir le produit, supprimer
- **Filtres** : Par état (neuf/seconde main), vendeur
- **Alertes stock** : Produits en rupture ou stock faible

### 🛒 Gestion des Commandes (`/admin/orders`)
- **Toutes les commandes** : Vue centralisée de toutes les transactions
- **Gestion des statuts** : Changer le statut des commandes
- **Détails complets** : Articles, prix, client, dates
- **Filtres avancés** : Par statut, client, produit
- **Statistiques** : Revenus, commandes par statut

### 📈 Analyses Avancées (`/admin/analytics`)
- **KPIs principaux** : Croissance, conversions, moyennes
- **Métriques de performance** : Taux de conversion, valeurs moyennes
- **Répartition utilisateurs** : Visualisation des rôles
- **Insights** : Points positifs et améliorations
- **Données temps réel** : Mise à jour automatique

### ⚙️ Paramètres (`/admin/settings`)
- **Configuration plateforme** : Nom, description, maintenance
- **Sécurité** : Tentatives de connexion, timeouts, 2FA
- **Notifications** : Emails, alertes, rapports
- **Informations système** : Versions, services connectés

## 🔐 Sécurité

### Rôles et Permissions
```typescript
interface UserRole {
  client: 'Parcourir et acheter'
  vendeur: 'Gérer produits et voir commandes'
  admin: 'Accès complet à toutes fonctionnalités'
}
```

### Fonctions de Sécurité Avancées
- **Changement de rôles** : Fonction SQL sécurisée `change_user_role()`
- **Suppression contrôlée** : Impossible de supprimer d'autres admins
- **Statistiques protégées** : Fonction `get_platform_stats()` admin-only
- **Politiques RLS** : Row Level Security pour tous les accès

## 🚀 Utilisation

### Accès Initial
1. Aller sur `/admin` 
2. Se connecter avec les identifiants admin
3. Le dashboard s'affiche avec toutes les statistiques

### Navigation
- **Dashboard** : Vue d'ensemble et accès rapide
- **Utilisateurs** : Gestion complète des comptes
- **Produits** : Supervision du catalogue
- **Commandes** : Suivi des ventes
- **Analytics** : Analyses approfondies
- **Paramètres** : Configuration système

### Actions Courantes

#### Changer le rôle d'un utilisateur
1. Aller dans **Gestion des utilisateurs**
2. Trouver l'utilisateur (recherche/filtre)
3. Cliquer sur **Rôle** → Sélectionner nouveau rôle
4. Changement immédiat

#### Gérer une commande
1. Aller dans **Gestion des commandes**
2. Trouver la commande
3. Utiliser les boutons d'action :
   - **Marquer payée** (si en attente)
   - **Marquer expédiée** (si payée)
   - **Annuler** (si nécessaire)

#### Supprimer un produit problématique
1. Aller dans **Gestion des produits**
2. Rechercher le produit
3. Cliquer **Voir** pour vérifier
4. Cliquer **Supprimer** et confirmer

## 📱 Responsive Design

Le système admin est entièrement responsive :
- **Mobile** : Navigation optimisée, tableaux scrollables
- **Tablet** : Grille adaptative, menus contextuels
- **Desktop** : Interface complète, multiples colonnes

## 🛠️ Développement

### Structure des fichiers
```
src/
├── app/admin/
│   ├── page.tsx              # Dashboard principal
│   ├── users/page.tsx        # Gestion utilisateurs
│   ├── products/page.tsx     # Gestion produits
│   ├── orders/page.tsx       # Gestion commandes
│   ├── analytics/page.tsx    # Analyses avancées
│   └── settings/page.tsx     # Paramètres
├── hooks/
│   └── useAdmin.ts           # Hook principal admin
└── components/auth/
    └── AuthGuard.tsx         # Protection des routes
```

### Hook useAdmin
```typescript
const { 
  isAdmin,           // Vérification du rôle
  loading,           // État de chargement
  error,             // Gestion d'erreurs
  getPlatformStats,  // Statistiques
  getAllUsers,       // Liste utilisateurs
  changeUserRole,    // Changer rôles
  deleteUser,        // Supprimer utilisateur
  getAllOrders,      // Toutes commandes
  updateOrderStatus, // Mettre à jour statut
  getAllProducts,    // Tous produits
  deleteProduct      // Supprimer produit
} = useAdmin()
```

## 🔍 Dépannage

### Problèmes courants

#### "Accès refusé"
- Vérifier que l'utilisateur a le rôle `admin`
- Vérifier la connexion à Supabase
- Vérifier les politiques RLS

#### Statistiques non chargées
- Vérifier la fonction `get_platform_stats()` en DB
- Vérifier les permissions sur les tables
- Regarder les erreurs dans la console

#### Changement de rôle échoue
- Vérifier la fonction `change_user_role()` en DB
- S'assurer que l'admin est connecté
- Vérifier que le nouveau rôle est valide

### Logs et Debug
- Tous les erreurs sont loggées dans la console
- Les hooks retournent des messages d'erreur détaillés
- Utiliser les outils de développement React

## 📈 Évolutions Futures

### Fonctionnalités prévues
- **Rapports PDF** : Export des statistiques
- **Notifications push** : Alertes temps réel
- **Audit logs** : Traçabilité des actions admin
- **Dashboard personnalisable** : Widgets configurables
- **Multi-admins** : Gestion des permissions granulaires

### Améliorations techniques
- **Cache intelligent** : Optimisation des performances
- **Websockets** : Mises à jour temps réel
- **API REST** : Endpoints admin dédiés
- **Tests automatisés** : Couverture complète

---

## 💡 Support

Pour toute question ou problème :
1. Consulter cette documentation
2. Vérifier les logs d'erreur
3. Tester avec les identifiants par défaut
4. Vérifier la configuration Supabase

**Version actuelle :** 2.0  
**Dernière mise à jour :** $(date '+%d/%m/%Y')
