import type { NextConfig } from 'next'
import { resolveSecurityEnv, securityHeaders } from './src/lib/security/headers'

const nextConfig: NextConfig = {
  // Typed routes turn a mistyped href into a type error, which is the mistake
  // a beginner makes most.
  typedRoutes: true,
  poweredByHeader: false,
  // Screens carry small text, so they get the higher of the two qualities.
  images: { formats: ['image/avif', 'image/webp'], qualities: [60, 75, 85] },
  // The site became one page on 2026-10-21. Every address the old site
  // published (the case studies, About, the resume and its PDF, and Notes,
  // already retired on 2026-09-12) lands on the section that replaced it.
  async redirects() {
    return [
      { source: '/about', destination: '/#about', permanent: true },
      { source: '/work', destination: '/#what', permanent: true },
      { source: '/work/:path*', destination: '/#what', permanent: true },
      { source: '/resume', destination: '/#about', permanent: true },
      { source: '/Caleb-Pham-Resume.pdf', destination: '/#about', permanent: true },
      { source: '/notes', destination: '/#what', permanent: true },
      { source: '/notes/:path*', destination: '/#what', permanent: true },
    ]
  },
  // Security headers on every response, the CSP included. THEY ARE BUILT IN
  // src/lib/security/headers.ts and pinned by headers.test.ts, which also
  // walks src/ for any resource that would need a new host. The policy is
  // enforced, names this origin only, and allows inline scripts because Next
  // inlines its hydration and a nonce would take every page out of static
  // rendering ("Static pages are generated at build time, when no request or
  // response headers exist, so no nonce can be injected"). Headers apply to
  // pages and public files alike.
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders(resolveSecurityEnv(process.env)) }]
  },
}

export default nextConfig
