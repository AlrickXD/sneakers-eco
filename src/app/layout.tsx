import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { CookieBanner } from '@/components/common/CookieBanner'
import { SetupAlert } from '@/components/common/SetupAlert'
import { PromoBar } from '@/components/common/PromoBar'
import { ScrollToTop } from '@/components/common/ScrollToTop'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Père2Chaussures - Marketplace éco-responsable',
  description: 'Le site éco-responsable pour les chaussures. Donnez une seconde vie à vos chaussures préférées.',
  icons: {
    icon: '/logo2.png',
    shortcut: '/logo2.png',
    apple: '/logo2.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <div className="min-h-screen flex flex-col">
                <PromoBar />
                <Navbar />
                <SetupAlert />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <CookieBanner />
                <ScrollToTop />
              </div>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}