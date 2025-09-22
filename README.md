# Père2Chaussures - Marketplace éco-responsable

Une marketplace Next.js moderne pour la vente de chaussures neuves et d'occasion, avec un focus sur l'éco-responsabilité et l'économie circulaire.

## 🚀 Fonctionnalités

### ✅ Authentification & Rôles
- **Client** : Parcours d'achat complet, historique des commandes
- **Vendeur** : Gestion des produits/variantes, suivi des commandes
- **Admin** : Vue globale, gestion des utilisateurs et rôles

### ✅ E-commerce complet
- Catalogue de produits avec filtres (catégorie, condition, taille, recherche)
- Fiches produits détaillées avec galerie d'images
- Panier persistant avec localStorage
- Checkout sécurisé via Stripe
- Gestion des stocks en temps réel

### ✅ UI/UX moderne
- Design style Adidas (noir/blanc, grilles nettes)
- Interface responsive (mobile/tablet/desktop)
- Composants réutilisables avec Tailwind CSS
- Accessibilité (a11y) de base

### ✅ Sécurité & RGPD
- Row Level Security (RLS) avec Supabase
- Bandeau cookies avec consentement
- Pages légales complètes
- Chiffrement des données sensibles

## 🛠 Stack technique

- **Frontend** : Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend** : Supabase (PostgreSQL, Auth, RLS)
- **Paiements** : Stripe Checkout + Webhooks
- **UI** : Lucide React icons, composants custom
- **Validation** : Zod + React Hook Form

## 📦 Installation

### 1. Cloner et installer les dépendances

```bash
git clone [votre-repo]
cd sneakers-eco
npm install
```

### 2. Configuration des variables d'environnement

Le fichier `.env.local` est déjà créé avec les bonnes valeurs. Vous devez seulement :

1. **Récupérer la clé service Supabase** :
   - Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
   - Projet → Settings → API
   - Copier la `service_role` key
   - Remplacer `SUPABASE_SERVICE_ROLE_KEY=...` dans `.env.local`

2. **Configurer le webhook Stripe** (voir section Stripe ci-dessous)

### 3. Configuration Supabase

1. **Exécuter les migrations SQL** :
   - Aller sur Supabase Dashboard → SQL Editor
   - Copier tout le contenu du fichier `supabase.sql`
   - Exécuter la requête
   - Vérifier que toutes les tables et policies sont créées

2. **Vérifier les données existantes** :
   - Les tables `products` et `product_variants` doivent déjà contenir des données
   - Sinon, ajouter quelques produits via l'interface admin

### 4. Configuration Stripe

1. **Installer Stripe CLI** :
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Autres OS : https://stripe.com/docs/stripe-cli
```

2. **Se connecter à Stripe** :
```bash
stripe login
```

3. **Écouter les webhooks en local** :
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. **Copier le webhook secret** :
   - La commande précédente affiche : `whsec_...`
   - Remplacer `STRIPE_WEBHOOK_SECRET=whsec_...` dans `.env.local`

5. **Redémarrer le serveur** après avoir mis à jour `.env.local`

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🧪 Tests

### Parcours client complet

1. **Inscription/Connexion** :
   - Créer un compte sur `/signup`
   - Se connecter sur `/login`

2. **Navigation** :
   - Parcourir les produits sur `/products`
   - Utiliser les filtres (neuf/seconde main, catégories)
   - Voir une fiche produit `/p/[product_id]`

3. **Achat** :
   - Ajouter des produits au panier
   - Aller sur `/cart`
   - Passer commande (redirection Stripe)
   - Utiliser la carte test : `4242 4242 4242 4242`
   - Vérifier la page de succès `/success`

4. **Compte client** :
   - Voir l'historique sur `/account`
   - Vérifier que la commande apparaît

### Tests vendeur

1. **Promouvoir un utilisateur** :
   - Se connecter en tant qu'admin
   - Aller sur `/admin/users`
   - Changer le rôle d'un utilisateur en "vendeur"

2. **Interface vendeur** :
   - Se connecter avec le compte vendeur
   - Accéder au dashboard `/seller`
   - Voir les statistiques et commandes

### Tests admin

1. **Utilisateur admin automatique** :
   - Les emails dans `ADMIN_EMAILS` sont automatiquement promus
   - Ou promouvoir manuellement via `/admin/users`

2. **Interface admin** :
   - Dashboard global `/admin`
   - Gestion des utilisateurs `/admin/users`
   - Statistiques complètes

### Test du webhook Stripe

1. **Vérifier que Stripe CLI écoute** :
   - La commande `stripe listen` doit être active
   - Les logs doivent s'afficher dans le terminal

2. **Passer une commande** :
   - Effectuer un achat test
   - Vérifier dans les logs Stripe que l'événement `checkout.session.completed` est reçu
   - Vérifier en base que le stock a été décrémenté

## 📁 Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── (auth)/            # Pages d'authentification
│   ├── account/           # Compte client
│   ├── admin/             # Interface admin
│   ├── api/               # API routes (checkout, webhook)
│   ├── cart/              # Panier
│   ├── legal/             # Pages légales
│   ├── p/[product_id]/    # Fiche produit
│   ├── products/          # Listing produits
│   ├── seller/            # Interface vendeur
│   └── success/           # Page de confirmation
├── components/            # Composants réutilisables
│   ├── auth/              # Authentification
│   ├── common/            # Composants communs
│   └── sneakers/          # Composants produits
├── contexts/              # Contexts React
├── lib/                   # Utilitaires
└── types/                 # Types TypeScript
```

## 🔐 Sécurité

### Row Level Security (RLS)

Toutes les tables sensibles sont protégées par RLS :
- `profiles` : Utilisateurs voient leurs propres données
- `orders` : Clients voient leurs commandes, vendeurs/admins voient tout
- `product_variants` : Lecture publique, écriture vendeur/admin

### Variables d'environnement

- ❌ **Ne jamais exposer** `SUPABASE_SERVICE_ROLE_KEY` côté client
- ✅ **Utiliser** uniquement dans les API routes serveur
- ✅ **Chiffrer** les communications (HTTPS en production)

### Validation des données

- Validation côté client avec Zod
- Validation côté serveur dans les API routes
- Contrôles d'accès sur chaque endpoint

## 🌍 Déploiement

### Vercel (recommandé)

1. **Connecter le repository** :
   - Aller sur [Vercel](https://vercel.com)
   - Importer le projet GitHub

2. **Configurer les variables d'environnement** :
   - Copier toutes les variables de `.env.local`
   - ⚠️ **Important** : Mettre à jour `SITE_URL` avec votre domaine de production

3. **Configurer le webhook Stripe en production** :
   ```bash
   # Créer un endpoint webhook sur Stripe Dashboard
   # URL : https://votre-domaine.com/api/stripe/webhook
   # Événements : checkout.session.completed
   # Copier le webhook secret dans les variables Vercel
   ```

### Autres plateformes

L'application est compatible avec toute plateforme supportant Next.js :
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🐛 Dépannage

### Erreurs courantes

1. **"Webhook signature verification failed"** :
   - Vérifier que `STRIPE_WEBHOOK_SECRET` est correct
   - S'assurer que Stripe CLI écoute sur le bon port

2. **"Row Level Security policy violation"** :
   - Vérifier que les policies RLS sont bien créées
   - S'assurer que l'utilisateur a les bonnes permissions

3. **"Products not found"** :
   - Vérifier que les tables `products` et `product_variants` contiennent des données
   - Ajouter des produits via l'interface admin

4. **Images ne s'affichent pas** :
   - Vérifier que les URLs d'images sont valides
   - Configurer les domaines d'images dans `next.config.js` si nécessaire

### Logs utiles

```bash
# Logs Stripe webhook
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Logs Next.js
npm run dev

# Logs Supabase (dashboard → Logs)
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🎯 Roadmap

### Fonctionnalités futures
- [ ] Système de reviews/notes
- [ ] Chat en temps réel vendeur/client
- [ ] Application mobile (React Native)
- [ ] Système de wishlist
- [ ] Programme de fidélité
- [ ] Intégration avec des APIs de tracking de livraison
- [ ] Système d'enchères pour les modèles rares
- [ ] Certification d'authenticité avec blockchain

### Améliorations techniques
- [ ] Tests automatisés (Jest, Cypress)
- [ ] Optimisation des performances (lazy loading, compression d'images)
- [ ] PWA (Progressive Web App)
- [ ] Analytics avancées
- [ ] A/B testing
- [ ] Monitoring des erreurs (Sentry)

---

**Développé avec ❤️ pour promouvoir une mode plus durable**