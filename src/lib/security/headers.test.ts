// The security headers are pinned here, verbatim, and the source tree is
// walked for anything the policy would block.
//
// A Content-Security-Policy is a list of hosts the browser may load from. A
// typo in it is not an error anywhere: the build is green, the page renders,
// and the browser quietly refuses the site's own fonts or video. The reverse
// is as quiet: a host added "for now" stays allowed for years. So the
// production policy is compared to an exact map, the development additions
// are compared to an exact list, the wiring in next.config.ts is called and
// compared to the module, and every browser-facing URL in src/ is checked
// against the policy.
//
// WHAT BREAKS IF THIS IS WRONG: a directive typo blocks the site's own video
// or hydration on every page, or a host nobody meant to allow ships in the
// header, and nothing on screen shows either.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import nextConfig from '../../../next.config'
import { buildCsp, cspDirectives, resolveSecurityEnv, securityHeaders } from './headers'

const SRC = fileURLToPath(new URL('../../', import.meta.url))

/** `name a b; name2 c` into `{ name: ['a', 'b'], name2: ['c'] }`. */
function parse(csp: string): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const part of csp.split(';')) {
    const [name, ...sources] = part.trim().split(/\s+/)
    if (name) out[name] = sources
  }
  return out
}

const PRODUCTION = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'"],
  'font-src': ["'self'"],
  'media-src': ["'self'"],
  'connect-src': ["'self'"],
  'frame-src': ["'none'"],
  'frame-ancestors': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'worker-src': ["'self'"],
  'manifest-src': ["'self'"],
}

describe('the production Content-Security-Policy', () => {
  const csp = buildCsp('production')

  it('is exactly the pinned policy', () => {
    expect(parse(csp)).toEqual(PRODUCTION)
    expect(cspDirectives('production')).toEqual(PRODUCTION)
  })

  it('names no scheme, wildcard or host beyond this origin', () => {
    for (const banned of ["'unsafe-eval'", 'data:', 'blob:', 'http:', 'ws:', '*', 'vercel.live', 'https://']) {
      expect(csp, `production policy contains ${banned}`).not.toContain(banned)
    }
  })

  it("allows inline scripts by 'unsafe-inline' alone: a nonce or hash source would silently cancel it", () => {
    const script = parse(csp)['script-src'].join(' ')
    expect(script).not.toMatch(/'nonce-|'sha(256|384|512)-|'strict-dynamic'/)
  })
})

describe('the development policy', () => {
  it('adds exactly eval, the analytics debug host and the HMR websocket', () => {
    const prod = cspDirectives('production')
    const dev = cspDirectives('development')
    const added: Record<string, string[]> = {}
    for (const [name, sources] of Object.entries(dev)) {
      const extra = sources.filter((s) => !prod[name].includes(s))
      if (extra.length) added[name] = extra
      expect(prod[name].every((s) => sources.includes(s)), `${name} lost a production source in development`).toBe(true)
    }
    expect(added).toEqual({
      'script-src': ["'unsafe-eval'", 'https://va.vercel-scripts.com'],
      'connect-src': ['ws://localhost:*', 'ws://127.0.0.1:*'],
    })
  })
})

describe('resolveSecurityEnv', () => {
  it('runs the development policy only under next dev', () => {
    expect(resolveSecurityEnv({})).toBe('production')
    expect(resolveSecurityEnv({ NODE_ENV: 'production' })).toBe('production')
    expect(resolveSecurityEnv({ NODE_ENV: 'test' })).toBe('production')
    expect(resolveSecurityEnv({ NODE_ENV: 'development' })).toBe('development')
    // A Vercel preview is a production build; it gets the production policy.
    expect(resolveSecurityEnv({ NODE_ENV: 'production', VERCEL_ENV: 'preview' })).toBe('production')
  })
})

describe('the header set', () => {
  const headers = securityHeaders('production')
  const byKey = Object.fromEntries(headers.map((h) => [h.key, h.value]))

  it('is six headers, each pinned', () => {
    expect(headers.map((h) => h.key)).toEqual([
      'Content-Security-Policy',
      'Strict-Transport-Security',
      'Permissions-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
    ])
    expect(byKey['Content-Security-Policy']).toBe(buildCsp('production'))
    expect(byKey['Strict-Transport-Security']).toBe('max-age=63072000; includeSubDomains')
    expect(byKey['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=(), payment=(), usb=()')
    expect(byKey['X-Frame-Options']).toBe('DENY')
    expect(byKey['X-Content-Type-Options']).toBe('nosniff')
    expect(byKey['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
  })

  it('never locks autoplay or fullscreen: the home and About clips autoplay muted', () => {
    expect(byKey['Permissions-Policy']).not.toMatch(/autoplay|fullscreen|picture-in-picture/)
  })

  it('omits HSTS preload, which is a separate and effectively irreversible decision', () => {
    expect(byKey['Strict-Transport-Security']).not.toContain('preload')
  })
})

describe('next.config.ts wiring', () => {
  it('puts the module headers on every path and keeps the immutable video rule', async () => {
    const rules = await nextConfig.headers!()
    const all = rules.find((r) => r.source === '/:path*')
    expect(all?.headers).toEqual(securityHeaders(resolveSecurityEnv(process.env)))
    const video = rules.find((r) => r.source === '/video/:path*')
    expect(video?.headers).toEqual([{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }])
    expect(rules.filter((r) => r.headers.some((h) => h.key === 'Content-Security-Policy'))).toHaveLength(1)
  })

  it('allows no remote image host, so img-src self is the whole truth', () => {
    expect(nextConfig.images?.remotePatterns).toBeUndefined()
    expect(nextConfig.images?.domains).toBeUndefined()
  })
})

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(tsx?|mdx|css)$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(full)
  }
  return out
}

const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

describe('nothing in src/ loads from another origin', () => {
  // href links (LinkedIn, Pexels credits, lumaiq.dev) are navigations, which
  // CSP does not govern; only resources the page itself fetches count.
  const LOADS = [
    /\b(?:src|srcSet|poster|href)\s*=\s*["'`{]?\s*["'`]?(https?:\/\/[^"'`\s)}]+)/g,
    /url\(\s*["']?(https?:\/\/[^"')]+)/g,
    /\b(?:fetch|import)\(\s*["'`](https?:\/\/[^"'`]+)/g,
    /new\s+(?:WebSocket|Worker|EventSource)\(\s*["'`]([^"'`]+)/g,
  ]
  it('names no off-origin resource; if one is needed, headers.ts and this test change first', () => {
    const offenders: string[] = []
    for (const file of walk(SRC)) {
      const text = stripComments(readFileSync(file, 'utf-8'))
      for (const re of LOADS) {
        for (const m of text.matchAll(re)) {
          const url = m[1]
          // <a href> and <link rel=...> navigations to another site are fine; a
          // resource load (src, srcSet, poster, url(), fetch, import) is not.
          const isAnchorHref = /\bhref\s*=/.test(m[0]) && !/<link/.test(text.slice(Math.max(0, m.index! - 200), m.index!))
          if (isAnchorHref) continue
          offenders.push(`${file.slice(SRC.length)} loads ${url}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
