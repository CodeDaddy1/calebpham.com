// Captures one LumaIQ screen from the City Storage demo tenant as a case-study
// figure. Never a client tenant: the shutter refuses a page that does not
// name the demo tenant and the demo persona, or that names a client.
//
//   node --env-file=.env.local scripts/capture-demo.mjs --route=/lien [--name=03-delinquency-lien] [--commit]
//
// Without --commit the capture lands in .captures/<name>.png (gitignored) for
// Caleb to approve. With --commit it is converted to a 1600 by 1000 WebP under
// public/work/lumaiq/ at or under 120 KB. Reads LUMAIQ_DEMO_EMAIL and
// LUMAIQ_DEMO_PASSWORD from .env.local; neither is ever printed.

import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('../', import.meta.url).pathname
const arg = (f) => process.argv.find((a) => a.startsWith(`--${f}=`))?.split('=').slice(1).join('=')
const ROUTE = arg('route') ?? '/lien'
const NAME = arg('name') ?? ROUTE.replace(/^\//, '').replace(/\//g, '-')
const COMMIT = process.argv.includes('--commit')
const BASE = 'https://www.lumaiq.dev'
const email = process.env.LUMAIQ_DEMO_EMAIL ?? ''
const password = (process.env.LUMAIQ_DEMO_PASSWORD ?? '').replace(/^['"]|['"]$/g, '')
if (!email || !password) { console.error('LUMAIQ_DEMO_EMAIL and LUMAIQ_DEMO_PASSWORD must be set (see .env.example)'); process.exit(1) }
if (!email.endsWith('@demo.lumaiq.dev')) { console.error('the demo persona lives on demo.lumaiq.dev; refusing any other account'); process.exit(1) }

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
await page.fill('input[type="email"], input[name="email"]', email)
await page.fill('input[type="password"], input[name="password"]', password)
await Promise.all([page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30000 }), page.click('button[type="submit"]')])
await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

const text = await page.evaluate(() => document.body.innerText)
// The demo tenant shows as "City Storage" on portfolio screens and as the
// persona block ("Tom Ostrander", "Demo") on every screen; either proves the
// tenant. A client name anywhere refuses the shutter.
const guards = [
  [text.includes('City Storage') || (text.includes('Tom Ostrander') && text.includes('Demo')), 'the page does not name the demo tenant or the demo persona'],
  [!/Jenkins|TJO/i.test(text), 'the page names a client tenant'],
]
for (const [ok, why] of guards) if (!ok) { console.error(`refused: ${why}`); await browser.close(); process.exit(1) }

const png = await page.screenshot({ type: 'png' })
const title = await page.title()
await browser.close()

mkdirSync(join(ROOT, '.captures'), { recursive: true })
const pngPath = join(ROOT, '.captures', `${NAME}.png`)
writeFileSync(pngPath, png)
console.log(`${pngPath}  ${(png.length / 1024).toFixed(0)} KB  title: ${title}`)

if (COMMIT) {
  let quality = 80
  let webp = await sharp(png).webp({ quality }).toBuffer()
  while (webp.length > 120 * 1024 && quality > 40) { quality -= 8; webp = await sharp(png).webp({ quality }).toBuffer() }
  const out = join(ROOT, 'public/work/lumaiq', `${NAME}.webp`)
  writeFileSync(out, webp)
  const meta = await sharp(webp).metadata()
  console.log(`public/work/lumaiq/${NAME}.webp  ${meta.width}x${meta.height}  ${(statSync(out).size / 1024).toFixed(0)} KB  q${quality}`)
}
