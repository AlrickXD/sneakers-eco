/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Autoriser les images depuis ces domaines
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Accepter tous les domaines HTTPS pour les images produits
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      }
    ],
    // Optimiser les images
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Optimiser les performances
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Configuration pour la production
  poweredByHeader: false,
  reactStrictMode: true,
  // Temporairement désactiver ESLint pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
