'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export function Footer() {
  const { profile } = useAuth()
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`grid gap-8 ${
          profile?.role === 'vendeur' || profile?.role === 'admin' 
            ? 'grid-cols-1' 
            : 'grid-cols-1 md:grid-cols-4'
        }`}>
          {/* Logo et description */}
          <div className={`col-span-1 ${
            profile?.role !== 'vendeur' && profile?.role !== 'admin' ? 'md:col-span-2' : ''
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/logo2.png" 
                alt="Père2Chaussures" 
                className="h-15 w-15 object-contain rounded"
              />
              <h3 className="text-2xl font-bold">PÈRE2CHAUSSURES</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Le site éco-responsable pour les chaussures. 
              Donnez une seconde vie à vos chaussures préférées et découvrez 
              des modèles uniques à prix réduits.
            </p>
            <p className="text-sm text-gray-400">
              🌱 Chaque achat contribue à réduire l&apos;impact environnemental de la mode
            </p>
          </div>

          {/* Liens utiles - Masqué pour vendeurs et admins */}
          {profile?.role !== 'vendeur' && profile?.role !== 'admin' && (
            <div>
              <h4 className="font-semibold mb-4">Liens utiles</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                    Tous les produits
                  </Link>
                </li>
                <li>
                  <Link href="/products?condition=new" className="text-gray-300 hover:text-white transition-colors">
                    Chaussures neuves
                  </Link>
                </li>
                <li>
                  <Link href="/products?condition=secondhand" className="text-gray-300 hover:text-white transition-colors">
                    Seconde main
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                    Espace vendeur
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Informations légales - Masqué pour vendeurs et admins */}
          {profile?.role !== 'vendeur' && profile?.role !== 'admin' && (
            <div>
              <h4 className="font-semibold mb-4">Informations</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/legal/privacy" className="text-gray-300 hover:text-white transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="text-gray-300 hover:text-white transition-colors">
                    Conditions d&apos;utilisation
                  </Link>
                </li>
                <li>
                  <Link href="/legal/returns" className="text-gray-300 hover:text-white transition-colors">
                    Retours et remboursements
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Père2Chaussures. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">
                🔒 Paiements sécurisés par Stripe
              </span>
              <span className="text-gray-400 text-sm">
                ♻️ Mode éco-responsable
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
