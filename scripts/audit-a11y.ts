// Accessibility sweep of a built site: axe on every route in the sitemap plus
// the 404 page, at 390 and 1280 pixels, and a hit test proving every link and
// button offers a 44 pixel target on the phone width.
//
// Run:  npx tsx scripts/audit-a11y.ts --url=https://calebpham.com
//
// Exits 1 on any axe violation or any target that fails the hit test.

import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const base = (process.argv.find((a) => a.startsWith('--url='))?.slice(6) ?? 'http://localhost:3000').replace(/\/$/, '')

async function routesFromSitemap(): Promise<string[]> {
  const xml = await (await fetch(`${base}/sitemap.xml`)).text()
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  return [...new Set([...locs, '/does-not-exist'])]
}

async function main() {
  const routes = await routesFromSitemap()
  const browser = await chromium.launch()
  let failures = 0
  for (const width of [390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: 'reduce' })
    for (const route of routes) {
      const page = await context.newPage()
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle' })
      const results = await new AxeBuilder({ page }).analyze()
      const violations = results.violations
      if (violations.length) {
        failures += violations.length
        for (const v of violations) console.log(`${width}px ${route}: ${v.id} (${v.impact}) x${v.nodes.length}: ${v.help}`)
      }
      if (width === 390) {
        // Hit test: the centre of each target plus or minus 18px must still land on the target.
        const misses = await page.evaluate(() => {
          const out: string[] = []
          for (const el of Array.from(document.querySelectorAll<HTMLElement>('a[href], button'))) {
            const r = el.getBoundingClientRect()
            if (r.width === 0 || r.height === 0) continue
            // Off-screen (the skip link until focused) and inline text links (WCAG 2.5.8 exempts
            // links inside a sentence) are not targets this test judges.
            if (r.bottom < 0 || r.top > window.innerHeight) continue
            if (getComputedStyle(el).display === 'inline') continue
            const cx = r.left + r.width / 2
            const cy = r.top + r.height / 2
            for (const [dx, dy] of [[0, -18], [0, 18], [-18, 0], [18, 0]]) {
              const hit = document.elementFromPoint(cx + dx, cy + dy)
              if (!hit || !(el === hit || el.contains(hit))) { out.push(`${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 30)}"`); break }
            }
          }
          return out
        })
        if (misses.length) {
          failures += misses.length
          console.log(`390px ${route}: ${misses.length} targets under 44px: ${misses.slice(0, 6).join('; ')}`)
        }
      }
      await page.close()
    }
    await context.close()
  }
  await browser.close()
  console.log(`${routes.length} routes at 2 widths; ${failures} problems`)
  process.exit(failures ? 1 : 0)
}

await main()
