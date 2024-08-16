import type { MetadataRoute } from 'next'
import { TURTLE_CONFIG } from '@/utils/turle.config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: TURTLE_CONFIG.name,
    short_name: 'Turtle',
    lang: 'en',
    description: TURTLE_CONFIG.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    categories: ['polkadot', 'ethereum', 'defi', 'blockchain', 'web3'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
