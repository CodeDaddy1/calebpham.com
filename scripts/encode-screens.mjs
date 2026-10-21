// Turns LumaIQ captures into the page's screen files.
//
// Run:  node scripts/encode-screens.mjs <capture dir> [name]
//
// The capture dir holds <name>-desktop.png (1600 by 1000) and
// <name>-phone.png (390 wide at 3x) for any of the three jobs. Each is
// written to public/screens/ as lossless WebP: these are the sources
// next/image resizes from, and a lossy source would blur small table text
// twice. Phones are cut to 780 wide, which covers the 300 CSS px frame at
// 2.6x without asking next/image for pixels the source does not have.

import sharp from 'sharp'
import { existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'public/screens')
const NAMES = ['owner-reports', 'rate-increases', 'lien']

const from = process.argv[2]
const only = process.argv[3]
if (!from) {
  console.error('usage: node scripts/encode-screens.mjs <capture dir> [name]')
  process.exit(1)
}
mkdirSync(OUT, { recursive: true })

for (const name of NAMES) {
  if (only && name !== only) continue
  for (const [kind, width] of [['desktop', 1600], ['phone', 780]]) {
    const src = join(from, `${name}-${kind}.png`)
    if (!existsSync(src)) continue
    const dest = join(OUT, `${name}-${kind}.webp`)
    const info = await sharp(src).resize({ width, withoutEnlargement: true }).webp({ lossless: true, effort: 6 }).toFile(dest)
    console.log(`${dest.slice(root.length + 1)}  ${info.width}x${info.height}  ${(statSync(dest).size / 1024).toFixed(0)} KB`)
  }
}
