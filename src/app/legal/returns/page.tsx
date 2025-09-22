export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-black mb-8">
            Retours et remboursements
          </h1>
          
          <div className="text-gray-600 mb-8">
            <p><strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}</p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">1. Droit de rétractation</h2>
            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⏰</span>
                <h3 className="text-lg font-semibold text-black">14 jours pour changer d&apos;avis</h3>
              </div>
              <p className="text-gray-700">
                Conformément à la réglementation européenne, vous disposez de 14 jours calendaires 
                à compter de la réception de votre commande pour exercer votre droit de rétractation, 
                sans avoir à justifier de motifs ni à payer de pénalités.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">📅 Calcul du délai</h3>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Début : Date de réception du colis</li>
                  <li>• Fin : 14 jours calendaires après</li>
                  <li>• Minuit le dernier jour</li>
                  <li>• Cachet de la poste faisant foi</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-black mb-2">📧 Comment exercer ce droit</h3>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Email à support@pere2chaussures.com</li>
                  <li>• Indiquer votre numéro de commande</li>
                  <li>• Préciser les articles concernés</li>
                  <li>• Nous vous enverrons les instructions</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">2. Conditions de retour</h2>
            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="font-semibold text-black mb-3">❌ Produits non retournables</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Articles personnalisés ou modifiés</li>
                  <li>• Produits d&apos;hygiène (semelles intérieures utilisées)</li>
                  <li>• Articles endommagés par l&apos;usage</li>
                  <li>• Produits sans emballage d&apos;origine</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-black mb-3">✅ Conditions à respecter</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-black mb-2">État du produit</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• État neuf et non porté</li>
                      <li>• Aucune trace d&apos;usage</li>
                      <li>• Pas d&apos;odeur</li>
                      <li>• Semelles propres</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-black mb-2">Emballage</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• Boîte d&apos;origine conservée</li>
                      <li>• Étiquettes non retirées</li>
                      <li>• Papier de soie inclus</li>
                      <li>• Accessoires éventuels</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">3. Processus de retour</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h3 className="font-medium text-black mb-1">Demande de retour</h3>
                  <p className="text-gray-700 text-sm">
                    Contactez-nous à support@pere2chaussures.com avec votre numéro de commande et le motif du retour.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h3 className="font-medium text-black mb-1">Autorisation de retour</h3>
                  <p className="text-gray-700 text-sm">
                    Nous vous envoyons un numéro d&apos;autorisation (RMA) et l&apos;étiquette de retour prépayée par email.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h3 className="font-medium text-black mb-1">Emballage</h3>
                  <p className="text-gray-700 text-sm">
                    Remettez les articles dans leur emballage d&apos;origine et collez l&apos;étiquette de retour.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h3 className="font-medium text-black mb-1">Expédition</h3>
                  <p className="text-gray-700 text-sm">
                    Déposez le colis dans un point relais ou remettez-le au transporteur. Conservez le récépissé.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                <div>
                  <h3 className="font-medium text-black mb-1">Traitement</h3>
                  <p className="text-gray-700 text-sm">
                    Nous traitons votre retour sous 48h après réception et vous informons par email.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">4. Frais de retour</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-black">Situation</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-black">Frais de retour</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-black">Qui paie ?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Changement d&apos;avis</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Gratuit*</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">Père2Chaussures</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Produit défectueux</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Gratuit</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">Père2Chaussures</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Erreur de livraison</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Gratuit</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">Père2Chaussures</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-700">Retour hors délai</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Non accepté</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 text-sm mt-3">
              * Étiquette de retour prépayée fournie pour la France métropolitaine et l&apos;Europe.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">5. Remboursements</h2>
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-black mb-3">💳 Modalités de remboursement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-black mb-2">Délai</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• 14 jours maximum après réception du retour</li>
                      <li>• Traitement sous 48h en moyenne</li>
                      <li>• Notification par email</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-black mb-2">Méthode</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• Sur le moyen de paiement utilisé</li>
                      <li>• Virement bancaire si nécessaire</li>
                      <li>• Pas de remboursement en espèces</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="font-semibold text-black mb-3">⏱️ Délais bancaires</h3>
                <div className="space-y-2 text-gray-700 text-sm">
                  <p>• <strong>Carte bancaire :</strong> 3-5 jours ouvrés</p>
                  <p>• <strong>PayPal :</strong> 1-3 jours ouvrés</p>
                  <p>• <strong>Virement :</strong> 1-2 jours ouvrés</p>
                  <p className="text-xs text-gray-600 mt-3">
                    Les délais peuvent varier selon votre banque et le moyen de paiement utilisé.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">6. Échanges</h2>
            <div className="bg-orange-50 p-6 rounded-lg">
              <h3 className="font-semibold text-black mb-3">🔄 Politique d&apos;échange</h3>
              <p className="text-gray-700 mb-4">
                Nous ne proposons pas d&apos;échange direct. Pour changer de taille ou de modèle :
              </p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Retournez l&apos;article selon la procédure standard</li>
                <li>Vous serez remboursé intégralement</li>
                <li>Passez une nouvelle commande pour l&apos;article souhaité</li>
              </ol>
              <p className="text-gray-600 text-sm mt-4">
                Cette méthode vous garantit le meilleur prix et la disponibilité en temps réel.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">7. Produits défectueux</h2>
            <div className="space-y-4">
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="font-semibold text-black mb-3">🔍 Que faire en cas de défaut ?</h3>
                <div className="space-y-3 text-gray-700">
                  <p>Si vous recevez un produit défectueux ou endommagé :</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Prenez des photos du défaut</li>
                    <li>Contactez-nous immédiatement</li>
                    <li>Gardez l&apos;emballage d&apos;origine</li>
                    <li>N&apos;utilisez pas le produit</li>
                  </ol>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-black mb-2">✅ Prise en charge</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Retour gratuit</li>
                    <li>• Remboursement intégral</li>
                    <li>• Ou remplacement si disponible</li>
                    <li>• Traitement prioritaire</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-black mb-2">📞 Contact express</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Email : defaut@pere2chaussures.com</li>
                    <li>• Réponse sous 24h</li>
                    <li>• Photos requises</li>
                    <li>• Numéro de commande obligatoire</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">8. Garanties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-black mb-3">🆕 Produits neufs</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Garantie constructeur applicable</li>
                  <li>• Défauts de fabrication couverts</li>
                  <li>• Durée selon la marque (6-24 mois)</li>
                  <li>• Certificat d&apos;authenticité fourni</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-black mb-3">♻️ Seconde main</h3>
                <ul className="text-gray-700 space-y-2">
                  <li>• Garantie légale de conformité</li>
                  <li>• Vérification qualité avant vente</li>
                  <li>• Description détaillée de l&apos;état</li>
                  <li>• Photos authentiques</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">9. Suivi de votre retour</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-black mb-3">📦 Traçabilité complète</h3>
              <div className="space-y-3 text-gray-700">
                <p>Vous recevrez des notifications automatiques :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Confirmation de la demande de retour</li>
                  <li>Envoi de l&apos;étiquette de retour</li>
                  <li>Réception du colis en entrepôt</li>
                  <li>Résultat du contrôle qualité</li>
                  <li>Confirmation du remboursement</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3">
                  Vous pouvez également suivre l&apos;état de votre retour dans votre espace client.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-black mb-4">10. Nous contacter</h2>
            <div className="bg-black text-white p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">💬 Service client</h3>
                  <div className="space-y-2 text-sm">
                    <p>Email : support@pere2chaussures.com</p>
                    <p>Délai de réponse : 24h maximum</p>
                    <p>Horaires : Lun-Ven 9h-18h</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">🚨 Urgences</h3>
                  <div className="space-y-2 text-sm">
                    <p>Produit défectueux : defaut@pere2chaussures.com</p>
                    <p>Erreur de livraison : erreur@pere2chaussures.com</p>
                    <p>Réponse prioritaire sous 12h</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-sm opacity-90">
                  Notre équipe est là pour vous accompagner et résoudre rapidement tous vos problèmes. 
                  N&apos;hésitez pas à nous contacter !
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
