import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Everything on this site is public. This file exists to name the sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
