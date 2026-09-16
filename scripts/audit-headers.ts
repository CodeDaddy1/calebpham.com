// Security header sweep of a built site: every response carries the six
// headers src/lib/security/headers.ts declares, and no page trips its own
// Content-Security-Policy in Chromium or WebKit.
//
// Run:  npx tsx scripts/audit-headers.ts --url=https://calebpham.com [--motion=reduce|no-preference]
//
// Pass 1 fetches every sitemap route, the 404, the resume PDF, a poster
// file and security.txt, and compares headers to the module, so the test
// suite's pin and the live site are the same thing. Pass 2 loads every HTML
// route in both engines with a securitypolicyviolation listener installed
// before any page script runs; --motion=no-preference mounts the clips so
// media-src is exercised too. A probe path is fetched last and its status
// printed: 403 means the firewall rule is live, 404 means the app answered.
//
// Exits 1 on any missing or different header, or any policy violation.

import { chromium, webkit } from 'playwright'
import { securityHeaders } from '../src/lib/security/headers'

const base = (process.argv.find((a) => a.startsWith('--url='))?.slice(6) ?? 'http://localhost:3000').replace(/\/$/, '')
const motion = (process.argv.find((a) => a.startsWith('--motion='))?.slice(9) ?? 'reduce') as 'reduce' | 'no-preference'

const EXPECTED = securityHeaders('production')
const IMMUTABLE = 'public, max-age=31536000, immutable'

async function routesFromSitemap(): Promise<string[]> {
  const xml = await (await fetch(`${base}/sitemap.xml`)).text()
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  return [...new Set(locs)]
}

/** The headers the site must carry on `path`, and the status and type it must answer with. */
function checkHeaders(path: string, res: Response, want: { status: number; type?: string; cache?: string }): string[] {
  const problems: string[] = []
  if (res.status !== want.status) problems.push(`${path}: status ${res.status}, expected ${want.status}`)
  const type = res.headers.get('content-type') ?? ''
  if (want.type && !type.startsWith(want.type)) problems.push(`${path}: content-type ${type || '(none)'}, expected ${want.type}`)
  for (const { key, value } of EXPECTED) {
    const got = res.headers.get(key)
    if (got !== value) problems.push(`${path}: ${key} is ${got === null ? 'missing' : JSON.stringify(got)}`)
  }
  if (want.cache && res.headers.get('cache-control') !== want.cache) problems.push(`${path}: cache-control ${res.headers.get('cache-control')}`)
  return problems
}

async function pass1(routes: string[]): Promise<string[]> {
  const problems: string[] = []
  const targets: [string, { status: number; type?: string; cache?: string }][] = [
    ...routes.map((r): [string, { status: number; type: string }] => [r, { status: 200, type: 'text/html' }]),
    ['/does-not-exist', { status: 404, type: 'text/html' }],
    ['/Caleb-Pham-Resume.pdf', { status: 200, type: 'application/pdf' }],
    ['/video/about-poster-900.webp', { status: 200, type: 'image/webp', cache: IMMUTABLE }],
    ['/.well-known/security.txt', { status: 200, type: 'text/plain' }],
  ]
  for (const [path, want] of targets) {
    const res = await fetch(`${base}${path}`, { redirect: 'manual' })
    problems.push(...checkHeaders(path, res, want))
  }
  return problems
}

async function pass2(routes: string[]): Promise<string[]> {
  const problems: string[] = []
  for (const [name, engine] of [['chromium', chromium], ['webkit', webkit]] as const) {
    const browser = await engine.launch()
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: motion })
    // Installed before any page script, so the first violation is not missed.
    await context.addInitScript(() => {
      const w = window as Window & { __csp?: string[] }
      w.__csp = []
      document.addEventListener('securitypolicyviolation', (e) => {
        w.__csp!.push(`${e.violatedDirective} blocked ${e.blockedURI || e.sourceFile || '(inline)'}`)
      })
    })
    for (const route of [...routes, '/does-not-exist']) {
      const page = await context.newPage()
      const console_: string[] = []
      // Policy messages only: on localhost the analytics script is a 404 served
      // as text/plain, and both engines "refuse to execute" it, which is nosniff
      // doing its job, not the policy.
      page.on('console', (m) => { if (m.type() === 'error' && /Content Security Policy/i.test(m.text())) console_.push(m.text().slice(0, 160)) })
      page.on('pageerror', (e) => console_.push(`pageerror: ${e.message.slice(0, 160)}`))
      await page.goto(`${base}${route}`, { waitUntil: 'load' })
      // The analytics script is deferred; the clips attach after mount.
      await page.waitForTimeout(800)
      await page.mouse.wheel(0, 4000)
      await page.waitForTimeout(400)
      const violations = await page.evaluate(() => (window as Window & { __csp?: string[] }).__csp ?? [])
      for (const v of [...new Set([...violations, ...console_])]) problems.push(`${name} ${route}: ${v}`)
      await page.close()
    }
    await context.close()
    await browser.close()
  }
  return problems
}

async function main() {
  const routes = await routesFromSitemap()
  const problems = [...(await pass1(routes)), ...(await pass2(routes))]
  for (const p of problems) console.log(p)
  // A path Vercel does not mitigate on its own, so the answer is the firewall rule's or the app's.
  const probe = await fetch(`${base}/backup.sql`, { redirect: 'manual' })
  console.log(`probe /backup.sql: ${probe.status}${probe.status === 403 ? ' (firewall)' : probe.status === 404 ? ' (app)' : ''}`)
  console.log(`${routes.length} routes, 2 engines (motion ${motion}); ${problems.length} problems`)
  process.exit(problems.length ? 1 : 0)
}

await main()
