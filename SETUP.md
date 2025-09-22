# Configuration finale de Père2Chaussures

## ✅ Étapes complétées

L'application Next.js a été créée avec succès avec toutes les fonctionnalités demandées :

- ✅ Structure Next.js 14 avec App Router et TypeScript
- ✅ Design style Adidas (noir/blanc, grilles nettes)
- ✅ Authentification complète avec rôles (client/vendeur/admin)
- ✅ Système de panier et checkout Stripe
- ✅ Interface responsive et accessible
- ✅ Pages légales RGPD complètes
- ✅ Build réussi sans erreurs critiques

## 🔧 Étapes restantes pour finaliser

### 1. Configuration Supabase (OBLIGATOIRE)

1. **Exécuter les migrations SQL** :
   - Ouvrir [Supabase Dashboard](https://supabase.com/dashboard)
   - Aller dans SQL Editor
   - Copier tout le contenu de `supabase.sql`
   - Exécuter la requête
   - Vérifier que les tables sont créées

2. **Récupérer la clé service** :
   - Dans Supabase : Settings → API
   - Copier la `service_role` key
   - Remplacer `SUPABASE_SERVICE_ROLE_KEY=...` dans `.env.local`

3. **Ajouter des données de test** :
   - Insérer quelques produits dans `products`
   - Ajouter des variantes dans `product_variants`
   - Ou utiliser l'interface admin après connexion

### 2. Configuration Stripe Webhook (OBLIGATOIRE)

1. **Installer Stripe CLI** :
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Autres : https://stripe.com/docs/stripe-cli
```

2. **Configurer le webhook** :
```bash
# Se connecter
stripe login

# Écouter les webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copier le whsec_... affiché et le mettre dans .env.local
```

3. **Redémarrer l'application** après avoir mis à jour `.env.local`

### 3. Test complet

1. **Lancer l'application** :
```bash
npm run dev
```

2. **Tester le parcours client** :
   - Créer un compte sur `/signup`
   - Parcourir les produits
   - Ajouter au panier
   - Passer commande (carte test : `4242 4242 4242 4242`)

3. **Tester les rôles** :
   - Se connecter en admin sur `/admin/users`
   - Changer le rôle d'un utilisateur
   - Tester l'interface vendeur `/seller`

## 🚀 Déploiement

### Vercel (recommandé)

1. Push le code sur GitHub
2. Connecter le repo sur [Vercel](https://vercel.com)
3. Configurer les variables d'environnement
4. **Important** : Mettre à jour `SITE_URL` avec le domaine de production
5. Configurer le webhook Stripe en production

### Variables d'environnement pour la production

```env
NEXT_PUBLIC_SUPABASE_URL=https://odnixinsfjmvoppzgpoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51S8zg7QUAS9IhVrX...
STRIPE_SECRET_KEY=sk_test_51S8zg7QUAS9IhVrX...
STRIPE_WEBHOOK_SECRET=whsec_... (différent en production)
SITE_URL=https://votre-domaine.vercel.app
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_EMAILS=admin@pere2chaussures.com,votre@email.com
```

## 📁 Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── account/           # Interface client
│   ├── admin/             # Interface admin
│   ├── api/               # API routes (checkout, webhook)
│   ├── cart/              # Panier
│   ├── legal/             # Pages légales
│   ├── p/[product_id]/    # Fiche produit
│   ├── products/          # Listing produits
│   ├── seller/            # Interface vendeur
│   └── success/           # Confirmation commande
├── components/            # Composants réutilisables
├── contexts/              # Contexts React (Auth, Cart)
├── lib/                   # Clients Supabase
└── types/                 # Types TypeScript
```

## 🎯 Fonctionnalités implémentées

### Authentification & Rôles
- Inscription/connexion avec email/password
- Rôles : client, vendeur, admin
- Protection des routes par rôle
- Promotion automatique des admins

### E-commerce
- Catalogue avec filtres (catégorie, condition, taille)
- Fiches produits avec galerie d'images
- Panier persistant
- Checkout Stripe sécurisé
- Webhook pour décrémenter le stock

### Interfaces par rôle
- **Client** : Parcours d'achat, historique commandes
- **Vendeur** : Gestion produits, suivi commandes
- **Admin** : Vue globale, gestion utilisateurs

### UI/UX
- Design style Adidas (noir/blanc)
- Responsive (mobile/tablet/desktop)
- Accessibilité de base
- Loading states et gestion d'erreurs

### Légal & RGPD
- Bandeau cookies avec consentement
- Politique de confidentialité complète
- Conditions d'utilisation
- Guide de retours

## 🔍 Dépannage

### Erreurs courantes

1. **"Webhook signature verification failed"**
   - Vérifier `STRIPE_WEBHOOK_SECRET`
   - S'assurer que Stripe CLI écoute

2. **"Row Level Security policy violation"**
   - Vérifier que les migrations SQL sont appliquées
   - Contrôler les permissions utilisateur

3. **Images ne s'affichent pas**
   - Vérifier les URLs dans la base de données
   - Configurer `next.config.js` si nécessaire

### Commandes utiles

```bash
# Développement
npm run dev

# Build
npm run build

# Linting
npm run lint

# Stripe webhook
npm run stripe:listen
```

## 📞 Support

Pour toute question ou problème :
1. Vérifier ce guide de setup
2. Consulter les logs de l'application
3. Vérifier la configuration des variables d'environnement
4. Tester les webhooks Stripe

---

**L'application est prête à être utilisée ! 🎉**
