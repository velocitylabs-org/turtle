import type { MetadataRoute } from 'next'
import { TURTLE_CONFIG } from '@/utils/turle.config'

export default function sitemap(): MetadataRoute.Sitemap {
  const defaultSite: MetadataRoute.Sitemap = [
    {
      url: `${TURTLE_CONFIG.url}`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ]

  return defaultSite
}
