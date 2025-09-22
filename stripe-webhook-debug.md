# 🔍 Diagnostic Webhook Stripe

## Problème identifié
- Le webhook reçoit des événements (`payment_method` visible dans les logs)
- MAIS l'événement `checkout.session.completed` n'arrive pas
- Résultat : Pas de commande créée en base de données

## ✅ Vérifications à faire

### 1. Configuration Webhook Stripe Dashboard
1. Aller sur https://dashboard.stripe.com/test/webhooks
2. Cliquer sur votre endpoint webhook
3. Vérifier que l'événement `checkout.session.completed` est coché
4. URL doit être : `https://votre-domaine.com/api/stripe/webhook`

### 2. Événements requis à activer
- ✅ `checkout.session.completed` (OBLIGATOIRE)
- ⚠️ `payment_intent.succeeded` (optionnel)
- ⚠️ `payment_intent.payment_failed` (optionnel)

### 3. Variables d'environnement
Vérifier dans votre `.env.local` :
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SITE_URL=http://localhost:3000
```

## 🛠️ Solution rapide

### Option 1: Reconfigurer le webhook
```bash
# Supprimer l'ancien webhook
stripe listen --list
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Récupérer le nouveau secret
# Mettre à jour STRIPE_WEBHOOK_SECRET dans .env.local
```

### Option 2: Configuration manuelle
1. Dashboard Stripe > Webhooks > Add endpoint
2. URL: `http://localhost:3000/api/stripe/webhook`
3. Événements: `checkout.session.completed`
4. Copier le signing secret dans .env.local

## 🔍 Test de diagnostic
Ajouter ceci temporairement dans le webhook pour voir tous les événements :

```typescript
console.log('=== WEBHOOK DEBUG ===')
console.log('Event type:', event.type)
console.log('Event data:', JSON.stringify(event.data, null, 2))
console.log('==================')
```

## 📋 Checklist de vérification
- [ ] Événement `checkout.session.completed` activé dans Stripe
- [ ] URL webhook correcte
- [ ] Secret webhook à jour
- [ ] Logs webhook dans terminal montrent l'événement
- [ ] Commande créée en base de données
- [ ] Page de succès affiche les détails


