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
    categories: ['blockchain', 'web3', 'polkadot', 'defi', 'ethereum'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
  }
}
