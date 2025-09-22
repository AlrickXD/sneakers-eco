#!/bin/bash

# Script pour démarrer Stripe CLI et mettre à jour automatiquement la clé webhook

echo "🚀 Démarrage de Stripe CLI..."

# Démarrer Stripe CLI en arrière-plan et capturer la sortie
stripe listen --forward-to localhost:3000/api/stripe/webhook 2>&1 | while IFS= read -r line; do
    echo "$line"
    
    # Chercher la ligne contenant la clé webhook
    if [[ $line =~ whsec_[a-zA-Z0-9]+ ]]; then
        webhook_secret=$(echo "$line" | grep -o 'whsec_[a-zA-Z0-9]\+')
        echo "🔑 Nouvelle clé webhook détectée: $webhook_secret"
        
        # Mettre à jour le fichier .env.local
        if [ -f .env.local ]; then
            # Remplacer la ligne existante
            sed -i '' "s/STRIPE_WEBHOOK_SECRET=.*/STRIPE_WEBHOOK_SECRET=$webhook_secret/" .env.local
        else
            # Créer le fichier s'il n'existe pas
            echo "STRIPE_WEBHOOK_SECRET=$webhook_secret" > .env.local
        fi
        
        echo "✅ Fichier .env.local mis à jour avec la nouvelle clé"
        echo "💡 Redémarrez votre serveur Next.js pour utiliser la nouvelle clé"
    fi
done


