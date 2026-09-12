// Prints /resume to public/Caleb-Pham-Resume.pdf and stamps the inputs.
//
// Run after a build:  npm run build && npm run resume:pdf
// (.mts so Node treats it as an ES module; the .ts import path is allowed by
// allowImportingTsExtensions in tsconfig, which is legal because the project
// is noEmit.)
//
// Starts `next start` on a free port so the served CSS is the production CSS
// (next dev injects its own), opens /resume with print media emulated, and
// writes a Letter PDF with no backgrounds (the print stylesheet drops every
// fill anyway). Then it hashes the three inputs the PDF depends on, the data,
// the document component, and the print block, into src/lib/resume.stamp.json.
// resume.stamp.test.ts recomputes that hash, so a change to any input without
// a regeneration turns the suite red.
//
// Vercel's build image has no Chromium, which is why this runs locally and the
// PDF is committed. Node 24 runs this .ts file directly (type stripping), so
// keep the syntax erasable: no enums, no parameter properties.

import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { existsSync, writeFileSync } from 'node:fs'
import { resumeStamp } from '../src/lib/resume-stamp.ts'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = `${ROOT}public/Caleb-Pham-Resume.pdf`

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer()
    srv.listen(0, () => {
      const address = srv.address()
      const port = typeof address === 'object' && address ? address.port : 0
      srv.close(() => (port ? resolve(port) : reject(new Error('no port'))))
    })
  })
}

async function waitFor(url: string, tries = 60): Promise<void> {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`server at ${url} did not answer`)
}

async function main() {
  if (!existsSync(`${ROOT}.next/BUILD_ID`)) {
    console.error('No production build found. Run `npm run build` first.')
    process.exit(1)
  }
  let chromium
  try {
    ;({ chromium } = await import('playwright'))
    await chromium.launch().then((b) => b.close())
  } catch {
    console.error('Playwright Chromium is not installed. Run: npx playwright install chromium')
    process.exit(1)
  }

  const port = await freePort()
  const server = spawn('npx', ['next', 'start', '-p', String(port)], { cwd: ROOT, stdio: 'ignore' })
  try {
    await waitFor(`http://localhost:${port}/resume`)
    const browser = await chromium.launch()
    const page = await browser.newPage()
    await page.goto(`http://localhost:${port}/resume`, { waitUntil: 'networkidle' })
    await page.emulateMedia({ media: 'print' })
    await page.waitForTimeout(400) // let any screen transition settle before colours are read
    // The print palette must actually apply: every piece of resume text has to
    // compute to a dark ink on paper. A print override on a weaker selector
    // than :root once lost to the screen tokens and shipped grey secondary text.
    const faint = await page.evaluate(() => {
      const lum = (r: number, g: number, b: number) => {
        const f = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
      }
      const out: string[] = []
      for (const el of Array.from(document.querySelectorAll<HTMLElement>('.resume *'))) {
        const text = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent?.trim() ?? '').join('')
        if (!text) continue
        const m = getComputedStyle(el).color.match(/\d+/g)
        if (!m) continue
        const [r, g, b] = m.map(Number)
        // #555555 is the lightest print ink; anything brighter is the screen palette leaking through.
        if (lum(r, g, b) > lum(0x55, 0x55, 0x55) + 0.001) out.push(`${el.tagName.toLowerCase()} rgb(${r}, ${g}, ${b}) "${text.slice(0, 40)}"`)
      }
      return out
    })
    if (faint.length) {
      console.error(`refusing to write a PDF with ${faint.length} text element(s) in the screen palette under print:\n  ${faint.slice(0, 8).join('\n  ')}`)
      await browser.close()
      process.exit(1)
    }
    await page.pdf({ path: OUT, format: 'Letter', preferCSSPageSize: true, printBackground: false })
    await browser.close()
  } finally {
    server.kill()
  }

  const stamp = resumeStamp()
  writeFileSync(`${ROOT}src/lib/resume.stamp.json`, `${JSON.stringify({ sha256: stamp, generatedAt: new Date().toISOString() }, null, 2)}\n`)
  console.log(`wrote public/Caleb-Pham-Resume.pdf and src/lib/resume.stamp.json (${stamp.slice(0, 12)})`)
}

await main()
