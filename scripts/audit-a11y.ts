// Accessibility sweep of a built site: axe on every route in the sitemap plus
// the 404 page, at 390 and 1280 pixels, and a hit test proving every link and
// button offers a 44 pixel target on the phone width.
//
// Run:  npx tsx scripts/audit-a11y.ts --url=https://calebpham.com [--motion=reduce|no-preference]
//
// The default pass runs with reduced motion, so the home page is audited in
// its poster state; --motion=no-preference mounts the video. Pages wait for
// `load` plus a settle rather than `networkidle`, because a looping video
// never idles.
//
// Exits 1 on any axe violation or any target that fails the hit test.

import { chromium } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'

const base = (process.argv.find((a) => a.startsWith('--url='))?.slice(6) ?? 'http://localhost:3000').replace(/\/$/, '')
const motion = (process.argv.find((a) => a.startsWith('--motion='))?.slice(9) ?? 'reduce') as 'reduce' | 'no-preference'

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
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: motion })
    for (const route of routes) {
      const page = await context.newPage()
      await page.goto(`${base}${route}`, { waitUntil: 'load' })
      // With motion on, the home page's hero fades in over 1.4 s; axe must not read it mid-fade.
      await page.waitForTimeout(motion === 'reduce' ? 400 : 1800)
      const results = await new AxeBuilder({ page }).analyze()
      const violations = results.violations
      if (violations.length) {
        failures += violations.length
        for (const v of violations) console.log(`${width}px ${route}: ${v.id} (${v.impact}) x${v.nodes.length}: ${v.help}`)
      }
      if (width === 390) {
        // Hit test: the centre of each target plus or minus 18px must still land on the target.
        // Run once as loaded and once with the phone menu open, so the menu's own links are judged.
        const hitTest = (scope = 'body') =>
          page.evaluate((scope) => {
            const out: string[] = []
            for (const el of Array.from(document.querySelectorAll<HTMLElement>(`${scope} a[href], ${scope} button, ${scope} summary`))) {
              const r = el.getBoundingClientRect()
              if (r.width === 0 || r.height === 0) continue
              // Content of a closed <details> keeps a box in Chromium but is not rendered.
              if (!el.checkVisibility() || el.closest('details:not([open]) > :not(summary)')) continue
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
          }, scope)
        const misses = await hitTest()
        const summary = page.locator('.nav-menu-summary')
        if (await summary.count()) {
          await summary.first().click()
          misses.push(...(await hitTest('.nav-menu-list')).map((m) => `${m} (menu open)`))
        }
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
  console.log(`${routes.length} routes at 2 widths (motion ${motion}); ${failures} problems`)
  process.exit(failures ? 1 : 0)
}

await main()
