// The security response headers, built once at build time.
//
// The site is static: seven pages, no forms, no route handlers, no remote
// images, and every production request is same-origin (measured with
// Playwright on 2026-09-16). So the Content-Security-Policy can name this
// origin and nothing else, and it is ENFORCED, not report-only: there is no
// report sink here, and scripts/audit-headers.ts is the report.
//
// script-src allows inline. Next inlines its own hydration scripts, and a
// nonce needs a request to be minted in, which would take every page out of
// static rendering (node_modules/next/dist/docs/01-app/02-guides/
// content-security-policy.md, "Without Nonces"). 'unsafe-inline' still pins
// every external script to this origin and refuses eval; on a site with no
// user input, inline injection has no way in. style-src allows inline because
// React style={{}} and shiki's coloured spans render as style="" attributes,
// which a hash cannot cover.
//
// Pure: takes the environment as an argument so the header is testable and
// headers.test.ts can pin it verbatim and walk src/ for any off-origin
// resource. Relative imports only: next.config.ts loads this file outside the
// bundler, where the @ alias does not exist.

export type SecurityEnv = 'production' | 'development'

/** `next dev` runs the development policy; a build, a test and a preview all run production. */
export function resolveSecurityEnv(env: Readonly<Record<string, string | undefined>>): SecurityEnv {
  return env.NODE_ENV === 'development' ? 'development' : 'production'
}

/** Directive order is the order the policy is written in; the test pins the map, not the string. */
export function cspDirectives(env: SecurityEnv): Record<string, string[]> {
  const dev = env === 'development'
  return {
    'default-src': ["'self'"],
    // Development: React uses eval to rebuild server error stacks in the
    // browser, and @vercel/analytics loads its debug build from
    // va.vercel-scripts.com. Neither happens in a production build.
    'script-src': ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'", 'https://va.vercel-scripts.com'] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    // No data: because the built HTML carries no data URIs (no blur placeholders).
    'img-src': ["'self'"],
    'font-src': ["'self'"],
    'media-src': ["'self'"],
    // Vercel serves the analytics script and its beacon from this origin (a per-project path). HMR is a websocket in development.
    'connect-src': ["'self'", ...(dev ? ['ws://localhost:*', 'ws://127.0.0.1:*'] : [])],
    'frame-src': ["'none'"],
    'frame-ancestors': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'worker-src': ["'self'"],
    'manifest-src': ["'self'"],
  }
}

export function buildCsp(env: SecurityEnv): string {
  return Object.entries(cspDirectives(env))
    .map(([name, sources]) => `${name} ${sources.join(' ')}`)
    .join('; ')
}

/** The six headers every response carries; next.config.ts puts them on /:path*. */
export function securityHeaders(env: SecurityEnv): { key: string; value: string }[] {
  return [
    { key: 'Content-Security-Policy', value: buildCsp(env) },
    // Vercel sets HSTS on its own without includeSubDomains; an app value
    // replaces it. preload is deliberately omitted: the preload list is
    // effectively irreversible and should be its own decision.
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
    // Nothing on the site asks for a device. autoplay and fullscreen are NOT
    // listed on purpose: the home and About clips autoplay muted.
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
    // frame-ancestors above is the modern rule; this one is for older browsers.
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ]
}
