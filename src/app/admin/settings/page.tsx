'use client'

import { useState } from 'react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { useAdmin } from '@/hooks/useAdmin'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { 
  Settings, 
  Database,
  Shield,
  Palette,
  Globe,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Server,
  Key,
  Mail,
  Smartphone,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [savedSection, setSavedSection] = useState<string | null>(null)

  // États pour les différents paramètres
  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'Sneakers-Eco',
    description: 'Plateforme de sneakers éco-responsable',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true
  })


  const [securitySettings, setSecuritySettings] = useState({
    maxLoginAttempts: 5,
    sessionTimeout: 60, // minutes
    requireStrongPasswords: true,
    enableTwoFactor: false
  })

  const handleSave = async (section: string) => {
    setSaving(true)
    
    // Simuler une sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSavedSection(section)
    setSaving(false)
    
    // Effacer le message après 3 secondes
    setTimeout(() => setSavedSection(null), 3000)
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              ⚙️ Paramètres administrateur
            </h1>
            <p className="text-gray-600">
              Configurer les paramètres généraux de la plateforme
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Paramètres de la plateforme */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-black">Paramètres de la plateforme</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du site
                  </label>
                  <input
                    type="text"
                    value={platformSettings.siteName}
                    onChange={(e) => setPlatformSettings({...platformSettings, siteName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={platformSettings.description}
                    onChange={(e) => setPlatformSettings({...platformSettings, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-black">Mode maintenance</h3>
                    <p className="text-sm text-gray-600">Désactiver temporairement le site pour maintenance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platformSettings.maintenanceMode}
                      onChange={(e) => setPlatformSettings({...platformSettings, maintenanceMode: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-black">Autoriser les inscriptions</h3>
                    <p className="text-sm text-gray-600">Permettre aux nouveaux utilisateurs de s'inscrire</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platformSettings.allowRegistration}
                      onChange={(e) => setPlatformSettings({...platformSettings, allowRegistration: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-black">Vérification email obligatoire</h3>
                    <p className="text-sm text-gray-600">Exiger la vérification de l'email lors de l'inscription</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={platformSettings.requireEmailVerification}
                      onChange={(e) => setPlatformSettings({...platformSettings, requireEmailVerification: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('platform')}
                  disabled={saving}
                  className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
                  Sauvegarder
                </button>
              </div>

              {savedSection === 'platform' && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Paramètres sauvegardés avec succès
                </div>
              )}
            </div>
          </div>

          {/* Paramètres de sécurité */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-red-600" />
                <h2 className="text-lg font-semibold text-black">Sécurité</h2>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tentatives de connexion max
                  </label>
                  <input
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout de session (minutes)
                  </label>
                  <input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    min="15"
                    max="480"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-black">Mots de passe forts obligatoires</h3>
                    <p className="text-sm text-gray-600">Exiger des mots de passe complexes (8+ caractères, majuscules, chiffres)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.requireStrongPasswords}
                      onChange={(e) => setSecuritySettings({...securitySettings, requireStrongPasswords: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-black">Authentification à deux facteurs</h3>
                    <p className="text-sm text-gray-600">Activer la 2FA pour les comptes administrateur</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.enableTwoFactor}
                      onChange={(e) => setSecuritySettings({...securitySettings, enableTwoFactor: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('security')}
                  disabled={saving}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
                  Sauvegarder
                </button>
              </div>

              {savedSection === 'security' && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Paramètres de sécurité sauvegardés
                </div>
              )}
            </div>
          </div>


          {/* Informations système */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <Server className="h-6 w-6 text-gray-600" />
                <h2 className="text-lg font-semibold text-black">Informations système</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Database className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-black">Base de données</div>
                      <div className="text-sm text-gray-600">Supabase PostgreSQL</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Key className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-black">Authentification</div>
                      <div className="text-sm text-gray-600">Supabase Auth</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-black">Paiements</div>
                      <div className="text-sm text-gray-600">Stripe (mode test)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Smartphone className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-medium text-black">Version</div>
                      <div className="text-sm text-gray-600">Sneakers-Eco v2.0</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note importante */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Info className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Note importante</h3>
          </div>
          <div className="text-blue-700 text-sm">
            <p>Les paramètres modifiés ici affectent l'ensemble de la plateforme. Certains changements peuvent nécessiter un redémarrage pour prendre effet. Assurez-vous de tester les modifications en mode développement avant de les appliquer en production.</p>
          </div>
        </div>
      </div>
      </div>
    </AdminGuard>
  )
}
