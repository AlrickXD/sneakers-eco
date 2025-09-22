import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Père2Chaussures - Marketplace éco-responsable',
    short_name: 'Père2Chaussures',
    description: 'Le site éco-responsable pour les chaussures neuves et d\'occasion',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['shopping', 'lifestyle', 'sustainability'],
    lang: 'fr-FR',
  }
}
