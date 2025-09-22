#!/bin/bash

echo "🔧 Configuration du webhook Stripe pour Père2Chaussures"
echo "=================================================="
echo ""

# Vérifier si Stripe CLI est installé
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI n'est pas installé."
    echo ""
    echo "Installation :"
    echo "macOS: brew install stripe/stripe-cli/stripe"
    echo "Autres: https://stripe.com/docs/stripe-cli"
    echo ""
    exit 1
fi

echo "✅ Stripe CLI détecté"

# Vérifier si l'utilisateur est connecté
if ! stripe auth &> /dev/null; then
    echo "🔐 Connexion à Stripe requise..."
    stripe login
fi

echo "✅ Connecté à Stripe"
echo ""
echo "🎧 Démarrage de l'écoute des webhooks..."
echo "📋 Copiez la clé 'whsec_...' qui va s'afficher ci-dessous"
echo "📝 Collez-la dans votre fichier .env.local"
echo "🔄 Puis redémarrez l'application"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter l'écoute"
echo "=================================================="

# Lancer l'écoute des webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
