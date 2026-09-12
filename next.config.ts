import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
  // MDX files are pages and content; typed routes turn a mistyped href into a
  // type error, which is the mistake a beginner makes most.
  pageExtensions: ['ts', 'tsx', 'mdx'],
  typedRoutes: true,
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'], qualities: [60, 75] },
  // Notes was removed on 2026-09-12 after one note had been live for a day and
  // in the sitemap; anything that indexed it lands on the case studies.
  async redirects() {
    return [
      { source: '/notes', destination: '/work', permanent: true },
      { source: '/notes/:path*', destination: '/work', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      {
        // The chapter clips and posters are content-addressed by name: a
        // re-encode changes the filename, never the bytes behind a URL, so
        // the browser may keep them for a year.
        source: '/video/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
}

// No remark or rehype plugins. Under Turbopack a plugin must be passed as a
// string name (node_modules/next/dist/docs/01-app/02-guides/mdx.md, "Using
// Plugins with Turbopack"); nothing here needs one. Code highlighting is a
// server component, not a plugin, so its colours stay under the contrast gate.
export default createMDX({})(nextConfig)
