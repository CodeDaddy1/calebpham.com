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
