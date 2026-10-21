// Turns app captures into the page's screen files.
//
// Run:  node scripts/encode-screens.mjs <capture dir> [name]
//
// The capture dir holds <name>-desktop.png (1600 by 1000) and
// <name>-phone.png (390 wide at 3x) for any of the three jobs. Each is
// written to public/screens/ as lossless WebP: these are the sources
// next/image resizes from, and a lossy source would blur small table text
// twice. Phones are cut to 780 wide, which covers the 300 CSS px frame at
// 2.6x without asking next/image for pixels the source does not have.
//
// Desktop captures lose the app's 232px sidebar: it is navigation, not the
// job, and until the app's own rename it carries the old name (2026-10-21).
//
// Every file is named by its content (<name>-<kind>-<hash>.webp) and listed
// in src/lib/screens.json, which the page reads. A retake therefore gets a
// new URL: next/image caches an optimised image by its source URL, so a
// retake under the old name kept serving the old picture (found 2026-10-21).
// The file a retake replaces is removed here; screens.test.ts fails on any
// file the manifest does not name.

import sharp from 'sharp'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'public/screens')
const MANIFEST = join(root, 'src/lib/screens.json')
const NAMES = ['owner-reports', 'rate-increases', 'lien']
const SIDEBAR = 232

const from = process.argv[2]
const only = process.argv[3]
if (!from) {
  console.error('usage: node scripts/encode-screens.mjs <capture dir> [name]')
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf-8')) : {}

for (const name of NAMES) {
  if (only && name !== only) continue
  for (const kind of ['desktop', 'phone']) {
    const src = join(from, `${name}-${kind}.png`)
    if (!existsSync(src)) continue
    const { width = 0, height = 0 } = await sharp(src).metadata()
    const image =
      kind === 'desktop'
        ? sharp(src).extract({ left: SIDEBAR, top: 0, width: width - SIDEBAR, height })
        : sharp(src).resize({ width: 780, withoutEnlargement: true })
    const { data, info } = await image.webp({ lossless: true, effort: 6 }).toBuffer({ resolveWithObject: true })
    const file = `${name}-${kind}-${createHash('sha256').update(data).digest('hex').slice(0, 8)}.webp`
    for (const old of readdirSync(OUT)) {
      if (old !== file && old.startsWith(`${name}-${kind}`)) unlinkSync(join(OUT, old))
    }
    writeFileSync(join(OUT, file), data)
    manifest[name] = { ...manifest[name], [kind]: { src: `/screens/${file}`, width: info.width, height: info.height } }
    console.log(`public/screens/${file}  ${info.width}x${info.height}  ${(data.length / 1024).toFixed(0)} KB`)
  }
}

writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)
