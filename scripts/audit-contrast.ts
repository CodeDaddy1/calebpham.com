// Measure real text contrast on every route.
//
// globals.contrast.test.ts proves the TOKENS clear WCAG AA. It says nothing
// about code that never reads them: an inline style, a literal in a component,
// a colour an MDX author typed. So this drives a real Chromium, walks every
// rendered text node, composites each colour against the background actually
// painted behind it, and reports what falls under the threshold. Port of
// LumaIQ's sweep with the sign-in machinery removed: every route here is
// public, and the routes come from the sitemap plus the 404 page.
//
//   npx tsx scripts/audit-contrast.ts [--url=http://localhost:3000] [--widths=390,1280]

import { chromium, type Page } from 'playwright'

const arg = (f: string) => process.argv.find((a) => a.startsWith(`--${f}=`))?.split('=').slice(1).join('=')
const BASE = (arg('url') ?? 'http://localhost:3000').replace(/\/$/, '')
const WIDTHS = (arg('widths') ?? '390,1280').split(',').map(Number)

async function routesFromSitemap(): Promise<string[]> {
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text()
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
  return [...new Set([...locs, '/does-not-exist'])]
}

/**
 * Every text node measured against the paint actually behind it. Three
 * things make a naive version report garbage: a transparent element over a
 * gradient (stops are averaged), background-clip text (skipped), and text
 * hidden by an ancestor's opacity or display (skipped by walking up).
 */
const PROBE = `() => {
  const lum = ([r,g,b]) => {
    const f = c => { const s = c/255; return s <= 0.04045 ? s/12.92 : ((s+0.055)/1.055)**2.4 }
    return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b)
  }
  const ratio = (a,b) => { const [hi,lo] = [lum(a),lum(b)].sort((x,y)=>y-x); return (hi+0.05)/(lo+0.05) }
  const parse = s => {
    const m = String(s).match(/rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)(?:,\\s*([\\d.]+))?\\)/)
    return m ? { rgb:[+m[1],+m[2],+m[3]], a: m[4] === undefined ? 1 : +m[4] } : null
  }
  const gradAvg = img => {
    if (!img || img === 'none') return null
    const stops = [...String(img).matchAll(/rgba?\\(([\\d.]+),\\s*([\\d.]+),\\s*([\\d.]+)/g)]
    if (!stops.length) return null
    return [0,1,2].map(i => Math.round(stops.reduce((a,m) => a + +m[i+1], 0) / stops.length))
  }
  const bgOf = el => {
    const stack = []
    let n = el
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n)
      const g = gradAvg(cs.backgroundImage)
      if (g) { stack.push({ rgb:g, a:1 }); break }
      const c = parse(cs.backgroundColor)
      if (c && c.a > 0) { stack.push(c); if (c.a === 1) break }
      n = n.parentElement
    }
    let base = [246,241,232]
    for (let i = stack.length - 1; i >= 0; i--) {
      const c = stack[i]
      base = c.rgb.map((v,j) => Math.round(v*c.a + base[j]*(1-c.a)))
    }
    return base
  }
  const out = []
  for (const el of document.querySelectorAll('body *')) {
    const txt = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('')
    if (!txt || txt.length < 2) continue
    const cs = getComputedStyle(el)
    if ((cs.webkitBackgroundClip || cs.backgroundClip) === 'text') continue
    let hidden = false
    for (let a = el; a && a.nodeType === 1; a = a.parentElement) {
      const ac = getComputedStyle(a)
      if (+ac.opacity === 0 || ac.visibility === 'hidden' || ac.display === 'none') { hidden = true; break }
      if (a.getBoundingClientRect().height === 0) { hidden = true; break }
    }
    if (hidden) continue
    const fg = parse(cs.color)
    if (!fg || fg.a === 0) continue
    const bg = bgOf(el)
    const composited = fg.rgb.map((v,j) => Math.round(v*fg.a + bg[j]*(1-fg.a)))
    const px = parseFloat(cs.fontSize)
    const large = px >= 24 || (+cs.fontWeight >= 700 && px >= 18.66)
    const need = large ? 3 : 4.5
    const cr = ratio(composited, bg)
    if (cr < need) out.push({ txt: txt.slice(0,46), px: +px.toFixed(1), cr: +cr.toFixed(2), need, tag: el.tagName.toLowerCase(), color: cs.color })
  }
  const seen = new Set()
  return out.filter(f => { const k = f.txt + f.cr; if (seen.has(k)) return false; seen.add(k); return true })
}`

type Failure = { txt: string; px: number; cr: number; need: number; tag: string; color: string }

async function auditRoute(page: Page, route: string): Promise<Failure[]> {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 45000 })
  await page.waitForTimeout(300)
  return page.evaluate(`(${PROBE})()`) as Promise<Failure[]>
}

async function main() {
  const routes = await routesFromSitemap()
  const browser = await chromium.launch()
  let total = 0
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    const page = await context.newPage()
    console.log(`\n== ${width}px`)
    for (const route of routes) {
      const fails = await auditRoute(page, route)
      total += fails.length
      console.log(`   ${fails.length === 0 ? 'ok    ' : 'FAIL  '} ${route.padEnd(44)} ${fails.length === 0 ? '' : `${fails.length} failure(s)`}`)
      for (const f of fails.slice(0, 8)) console.log(`          ${String(f.cr).padStart(5)}:1 (needs ${f.need})  ${String(f.px).padStart(5)}px  ${f.color.padEnd(22)} <${f.tag}> "${f.txt}"`)
    }
    await context.close()
  }
  await browser.close()
  console.log(`\n${total === 0 ? 'PASS' : 'FAIL'}: ${total} contrast failure(s) across ${routes.length} routes at ${WIDTHS.length} widths`)
  process.exit(total === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })
