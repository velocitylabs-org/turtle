import type { MetadataRoute } from 'next'
import { TURTLE_CONFIG } from '@/utils/turle.config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${TURTLE_CONFIG.url}/sitemap.xml`,
  }
}
