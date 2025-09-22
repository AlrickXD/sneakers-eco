export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-black mb-8">
            Politique de confidentialité
          </h1>
          
          <div className="text-gray-600 mb-8">
            <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}</p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">1. Qui sommes-nous ?</h2>
            <p className="text-gray-700 mb-4">
              Père2Chaussures est une marketplace éco-responsable dédiée à la vente de chaussures neuves et d&apos;occasion. 
              Nous nous engageons à protéger votre vie privée et à traiter vos données personnelles de manière transparente.
            </p>
            <p className="text-gray-700">
              <strong>Responsable du traitement :</strong> Père2Chaussures<br />
              <strong>Contact :</strong> contact@pere2chaussures.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">2. Quelles données collectons-nous ?</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-black mb-2">Données d&apos;identification</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Adresse e-mail (obligatoire pour l&apos;inscription)</li>
                  <li>Nom d&apos;affichage (optionnel)</li>
                  <li>Mot de passe (chiffré)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-black mb-2">Données de commande</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Historique des achats</li>
                  <li>Adresses de livraison et facturation</li>
                  <li>Informations de paiement (traitées par Stripe)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-black mb-2">Données techniques</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Adresse IP</li>
                  <li>Type de navigateur et système d&apos;exploitation</li>
                  <li>Pages visitées et temps de navigation</li>
                  <li>Cookies (avec votre consentement)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">3. Pourquoi collectons-nous ces données ?</h2>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">🛒 Gestion des commandes</h3>
                <p className="text-gray-700 text-sm">
                  Traiter vos achats, gérer les livraisons et assurer le service client.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">🔐 Authentification</h3>
                <p className="text-gray-700 text-sm">
                  Sécuriser votre compte et personnaliser votre expérience.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">📊 Amélioration du service</h3>
                <p className="text-gray-700 text-sm">
                  Analyser l&apos;utilisation du site pour améliorer nos services (avec votre consentement).
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">⚖️ Obligations légales</h3>
                <p className="text-gray-700 text-sm">
                  Respecter nos obligations comptables et fiscales.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">4. Combien de temps conservons-nous vos données ?</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-black">Type de données</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-black">Durée de conservation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700">Compte utilisateur</td>
                    <td className="px-4 py-2 text-sm text-gray-700">Jusqu&apos;à suppression du compte</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700">Historique des commandes</td>
                    <td className="px-4 py-2 text-sm text-gray-700">10 ans (obligation comptable)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700">Données de navigation</td>
                    <td className="px-4 py-2 text-sm text-gray-700">13 mois maximum</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700">Cookies</td>
                    <td className="px-4 py-2 text-sm text-gray-700">13 mois maximum</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">5. Avec qui partageons-nous vos données ?</h2>
            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">🏦 Stripe (Paiements)</h3>
                <p className="text-gray-700 text-sm">
                  Traitement sécurisé des paiements. Stripe respecte les normes PCI DSS.
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">🗄️ Supabase (Hébergement)</h3>
                <p className="text-gray-700 text-sm">
                  Hébergement sécurisé de la base de données en Europe.
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">❌ Pas de vente de données</h3>
                <p className="text-gray-700 text-sm">
                  Nous ne vendons jamais vos données personnelles à des tiers.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">6. Vos droits</h2>
            <p className="text-gray-700 mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">✅ Droit d&apos;accès</h3>
                <p className="text-gray-700 text-sm">Connaître les données que nous avons sur vous</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">✏️ Droit de rectification</h3>
                <p className="text-gray-700 text-sm">Corriger vos données inexactes</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">🗑️ Droit à l&apos;effacement</h3>
                <p className="text-gray-700 text-sm">Supprimer vos données personnelles</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">📦 Droit à la portabilité</h3>
                <p className="text-gray-700 text-sm">Récupérer vos données dans un format lisible</p>
              </div>
            </div>
            <p className="text-gray-700 mt-4">
              <strong>Pour exercer vos droits :</strong> Contactez-nous à <a href="mailto:privacy@pere2chaussures.com" className="text-black underline">privacy@pere2chaussures.com</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">7. Cookies</h2>
            <p className="text-gray-700 mb-4">
              Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences via le bandeau de cookies.
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-black mb-2">🍪 Types de cookies</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• <strong>Essentiels :</strong> Nécessaires au fonctionnement du site</li>
                <li>• <strong>Analytiques :</strong> Mesure d&apos;audience (avec votre consentement)</li>
                <li>• <strong>Préférences :</strong> Mémorisation de vos choix</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">8. Sécurité</h2>
            <p className="text-gray-700 mb-4">
              Nous mettons en place des mesures techniques et organisationnelles appropriées pour protéger vos données :
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Chiffrement des données sensibles (HTTPS/SSL)</li>
              <li>Authentification sécurisée</li>
              <li>Accès restreint aux données personnelles</li>
              <li>Sauvegardes régulières et sécurisées</li>
              <li>Surveillance des accès</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">9. Contact et réclamations</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email :</strong> <a href="mailto:privacy@pere2chaussures.com" className="text-black underline">privacy@pere2chaussures.com</a></p>
                <p><strong>Délai de réponse :</strong> 30 jours maximum</p>
              </div>
              <p className="text-gray-700 mt-4">
                Si vous n&apos;êtes pas satisfait de notre réponse, vous pouvez saisir la CNIL : 
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-black underline ml-1">
                  www.cnil.fr
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-4">10. Modifications</h2>
            <p className="text-gray-700">
              Cette politique de confidentialité peut être modifiée pour refléter les changements dans nos pratiques 
              ou la réglementation. Les modifications importantes vous seront notifiées par email ou via le site.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
