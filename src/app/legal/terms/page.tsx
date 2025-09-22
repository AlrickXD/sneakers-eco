export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-black mb-8">
            Conditions d&apos;utilisation
          </h1>
          
          <div className="text-gray-600 mb-8">
            <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}</p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">1. Présentation</h2>
            <p className="text-gray-700 mb-4">
              Père2Chaussures est une marketplace en ligne dédiée à la vente de chaussures neuves et d&apos;occasion, 
              dans une démarche éco-responsable. En utilisant notre site, vous acceptez les présentes conditions d&apos;utilisation.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>💡 Notre mission :</strong> Promouvoir l&apos;économie circulaire dans l&apos;industrie de la sneaker 
                en donnant une seconde vie aux produits et en réduisant l&apos;impact environnemental.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">2. Accès au service</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-black mb-2">Conditions d&apos;accès</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Être âgé d&apos;au moins 18 ans ou avoir l&apos;autorisation parentale</li>
                  <li>Fournir des informations exactes lors de l&apos;inscription</li>
                  <li>Respecter les présentes conditions d&apos;utilisation</li>
                  <li>Ne pas utiliser le service à des fins illégales</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-black mb-2">Création de compte</h3>
                <p className="text-gray-700">
                  L&apos;inscription est gratuite et nécessaire pour effectuer des achats. Vous êtes responsable 
                  de la confidentialité de vos identifiants et de toutes les activités sur votre compte.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">3. Rôles des utilisateurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">👤 Client</h3>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Parcourir le catalogue</li>
                  <li>• Effectuer des achats</li>
                  <li>• Gérer son compte</li>
                  <li>• Consulter l&apos;historique</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">🏪 Vendeur</h3>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Ajouter des produits</li>
                  <li>• Gérer les stocks</li>
                  <li>• Traiter les commandes</li>
                  <li>• Accès aux outils vendeur</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">👑 Administrateur</h3>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Gestion complète</li>
                  <li>• Modération du contenu</li>
                  <li>• Gestion des utilisateurs</li>
                  <li>• Accès aux statistiques</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">4. Commandes et paiements</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-black mb-2">Processus de commande</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-1">
                  <li>Sélection des produits et ajout au panier</li>
                  <li>Vérification du panier et des informations</li>
                  <li>Paiement sécurisé via Stripe</li>
                  <li>Confirmation de commande par email</li>
                  <li>Préparation et expédition</li>
                </ol>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">💳 Paiements</h3>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Paiement sécurisé par Stripe (norme PCI DSS)</li>
                  <li>• Cartes bancaires acceptées : Visa, Mastercard, American Express</li>
                  <li>• Aucune donnée bancaire stockée sur nos serveurs</li>
                  <li>• Facturation en euros (EUR)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">5. Livraison</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-black">Zone</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-black">Délai</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-black">Prix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700">France métropolitaine</td>
                    <td className="px-4 py-2 text-sm text-gray-700">3-5 jours ouvrés</td>
                    <td className="px-4 py-2 text-sm font-medium text-green-600">Gratuit</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-sm text-gray-700">Europe (BE, CH, LU, MC)</td>
                    <td className="px-4 py-2 text-sm text-gray-700">5-7 jours ouvrés</td>
                    <td className="px-4 py-2 text-sm font-medium text-green-600">Gratuit</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 mt-4 text-sm">
              Les délais sont donnés à titre indicatif. Un suivi de commande vous sera communiqué par email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">6. Droit de rétractation</h2>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="font-medium text-black mb-3">⏰ Délai de rétractation : 14 jours</h3>
              <div className="space-y-3 text-gray-700 text-sm">
                <p>
                  Vous disposez de 14 jours à compter de la réception de votre commande pour exercer 
                  votre droit de rétractation, sans avoir à justifier de motifs.
                </p>
                <div>
                  <p className="font-medium text-black mb-2">Conditions de retour :</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Produits dans leur état d&apos;origine</li>
                    <li>Emballage d&apos;origine conservé</li>
                    <li>Étiquettes non retirées</li>
                    <li>Aucun signe d&apos;utilisation</li>
                  </ul>
                </div>
                <p>
                  <strong>Frais de retour :</strong> À votre charge, sauf en cas de produit défectueux.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">7. Garanties et responsabilité</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-black mb-2">Garantie des produits</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Produits neufs :</strong> Garantie constructeur selon les conditions du fabricant</li>
                  <li><strong>Produits d&apos;occasion :</strong> Garantie de conformité légale (défauts cachés)</li>
                  <li><strong>Description :</strong> Nous nous efforçons de décrire fidèlement tous les produits</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">⚠️ Limites de responsabilité</h3>
                <p className="text-gray-700 text-sm">
                  Notre responsabilité est limitée au prix d&apos;achat du produit. Nous ne saurions être tenus 
                  responsables des dommages indirects ou de l&apos;usage particulier que vous pourriez faire des produits.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">8. Propriété intellectuelle</h2>
            <p className="text-gray-700 mb-4">
              Tous les éléments du site (textes, images, logos, design) sont protégés par le droit d&apos;auteur 
              et appartiennent à Père2Chaussures ou à leurs propriétaires respectifs.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-black mb-2">Utilisation autorisée</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Consultation personnelle et non commerciale</li>
                <li>• Partage des liens vers nos produits</li>
                <li>• Impression pour usage personnel</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">9. Protection des données</h2>
            <p className="text-gray-700 mb-4">
              Vos données personnelles sont traitées conformément à notre 
              <a href="/legal/privacy" className="text-black underline ml-1">Politique de confidentialité</a>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">🔐 Sécurité</h3>
                <p className="text-gray-700 text-sm">
                  Chiffrement SSL, authentification sécurisée, accès restreints.
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">✅ Vos droits RGPD</h3>
                <p className="text-gray-700 text-sm">
                  Accès, rectification, suppression, portabilité de vos données.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">10. Résolution des litiges</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-black mb-2">Médiation</h3>
                <p className="text-gray-700">
                  En cas de litige, nous privilégions une résolution amiable. Contactez notre service client 
                  à <a href="mailto:support@pere2chaussures.com" className="text-black underline">support@pere2chaussures.com</a>.
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">🏛️ Droit applicable</h3>
                <p className="text-gray-700 text-sm">
                  Les présentes conditions sont régies par le droit français. 
                  En cas de litige persistant, les tribunaux français seront compétents.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">11. Modifications</h2>
            <p className="text-gray-700">
              Ces conditions peuvent être modifiées à tout moment. Les modifications importantes 
              vous seront notifiées par email ou via le site. L&apos;utilisation continue du service 
              vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-4">12. Contact</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-2 text-gray-700">
                <p><strong>Père2Chaussures</strong></p>
                <p><strong>Email :</strong> <a href="mailto:contact@pere2chaussures.com" className="text-black underline">contact@pere2chaussures.com</a></p>
                <p><strong>Support client :</strong> <a href="mailto:support@pere2chaussures.com" className="text-black underline">support@pere2chaussures.com</a></p>
                <p><strong>Horaires :</strong> Lundi au vendredi, 9h-18h</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
