import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'

// One page. sitemap.test.ts walks src/app for page.tsx files and fails if
// this list and the routes on disk ever disagree in either direction, which
// is how a page gets added without anyone remembering this file.

// A build-time constant rather than `new Date()` per request: the sitemap is
// static, so the date is the deploy date.
const BUILD_DATE = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: absoluteUrl('/'), lastModified: BUILD_DATE, changeFrequency: 'monthly', priority: 1 }]
}
