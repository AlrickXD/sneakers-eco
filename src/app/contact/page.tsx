import Link from 'next/link'
import { Mail, MessageCircle, HelpCircle, ArrowLeft, Package } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* En-tête */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          <h1 className="text-4xl font-bold text-black mb-4">
            Aide & Contact
          </h1>
          <p className="text-xl text-gray-600">
            Nous sommes là pour vous aider ! Trouvez les réponses à vos questions ou contactez-nous directement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Section FAQ */}
          <div>
            <h2 className="text-2xl font-semibold text-black mb-6 flex items-center gap-2">
              <HelpCircle className="h-6 w-6" />
              Questions fréquentes
            </h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-black mb-2">
                  Comment suivre ma commande ?
                </h3>
                <p className="text-gray-600 mb-3">
                  Connectez-vous à votre compte pour suivre l'état de vos commandes en temps réel.
                </p>
                <Link 
                  href="/account" 
                  className="text-black font-medium hover:underline"
                >
                  Mon compte →
                </Link>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-black mb-2">
                  Politique de retour
                </h3>
                <p className="text-gray-600 mb-3">
                  Consultez notre politique complète de retours et remboursements.
                </p>
                <Link 
                  href="/legal/returns" 
                  className="text-black font-medium hover:underline"
                >
                  Voir la politique →
                </Link>
              </div>
            </div>
          </div>

          {/* Section Contact */}
          <div>
            <h2 className="text-2xl font-semibold text-black mb-6 flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Nous contacter
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-black mt-1" />
                  <div>
                    <h3 className="font-semibold text-black mb-2">
                      Support client
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Pour toute question sur vos commandes, retours ou problèmes techniques.
                    </p>
                    <a 
                      href="mailto:support@pere2chaussures.com" 
                      className="text-black font-medium hover:underline"
                    >
                      support@pere2chaussures.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Package className="h-6 w-6 text-black mt-1" />
                  <div>
                    <h3 className="font-semibold text-black mb-2">
                      Espace vendeur
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Questions sur la vente, gestion des produits ou paiements vendeur.
                    </p>
                    <a 
                      href="mailto:vendeur@pere2chaussures.com" 
                      className="text-black font-medium hover:underline"
                    >
                      vendeur@pere2chaussures.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <HelpCircle className="h-6 w-6 text-black mt-1" />
                  <div>
                    <h3 className="font-semibold text-black mb-2">
                      Contact général
                    </h3>
                    <p className="text-gray-600 mb-3">
                      Pour toute autre question ou suggestion d'amélioration.
                    </p>
                    <a 
                      href="mailto:contact@pere2chaussures.com" 
                      className="text-black font-medium hover:underline"
                    >
                      contact@pere2chaussures.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Temps de réponse */}
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                <strong>Temps de réponse :</strong> Nous nous efforçons de répondre à tous les emails dans les 24h ouvrées.
              </p>
            </div>
          </div>
        </div>

        {/* Liens utiles */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-black mb-6">Liens utiles</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/legal/terms" 
              className="text-gray-600 hover:text-black transition-colors"
            >
              Conditions d'utilisation
            </Link>
            <Link 
              href="/legal/privacy" 
              className="text-gray-600 hover:text-black transition-colors"
            >
              Confidentialité
            </Link>
            <Link 
              href="/legal/returns" 
              className="text-gray-600 hover:text-black transition-colors"
            >
              Retours
            </Link>
            <Link 
              href="/products" 
              className="text-gray-600 hover:text-black transition-colors"
            >
              Tous les produits
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
