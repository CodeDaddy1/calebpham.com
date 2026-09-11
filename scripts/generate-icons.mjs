// Generates every icon from one definition of the mark.
//
// Run with:  npm run icons
//
// Port of LumaIQ's script. The mark is two rust bars forming a corner, the
// same shape the OG card draws in src/lib/og-image.tsx. Every output is built
// by scaling one SVG, so a size can be added without a hand-pasted raster.
//
// Sizes are full-bleed on purpose: iOS, macOS Safari, and Android all apply
// their own corner mask to an app icon, so a radius baked in here would be
// rounded twice. There is no web manifest, so no `maskable` claim is made.

import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const PAPER = '#F6F1E8' // --background
const RUST = '#9F4716' // --accent

// The mark in its own 56-unit space: a 44 by 12 bar over a 12 by 44 bar,
// sharing the top-left corner. Its ink spans x 6 to 50, y 6 to 50.
const MARK_VIEWBOX = { x: 6, y: 6, w: 44, h: 44 }

// Share of the square the mark occupies. 0.72 keeps the corner clear of the
// platform mask on a 180px Apple touch icon while filling the tile.
const MARK_SCALE = 0.72

function iconSvg(size) {
  const w = size * MARK_SCALE
  const h = w
  const x = (size - w) / 2
  const y = (size - h) / 2
  const round = (n) => Number(n.toFixed(3))

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img">
  <title>Caleb Pham</title>
  <rect width="${size}" height="${size}" fill="${PAPER}"/>
  <svg x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" viewBox="${MARK_VIEWBOX.x} ${MARK_VIEWBOX.y} ${MARK_VIEWBOX.w} ${MARK_VIEWBOX.h}" preserveAspectRatio="xMidYMid meet">
    <rect x="6" y="6" width="44" height="12" rx="2" fill="${RUST}"/>
    <rect x="6" y="6" width="12" height="44" rx="2" fill="${RUST}"/>
  </svg>
</svg>
`
}

const png = (size) =>
  sharp(Buffer.from(iconSvg(size)), { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer()

// sharp cannot write ICO, and the format is small enough to assemble directly:
// a 6-byte header, one 16-byte directory entry per frame, then the frames.
function buildIco(frames) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(frames.length, 4)

  const directory = Buffer.alloc(16 * frames.length)
  let offset = header.length + directory.length

  frames.forEach(({ size, data }, i) => {
    const at = i * 16
    directory.writeUInt8(size >= 256 ? 0 : size, at)
    directory.writeUInt8(size >= 256 ? 0 : size, at + 1)
    directory.writeUInt8(0, at + 2)
    directory.writeUInt8(0, at + 3)
    directory.writeUInt16LE(1, at + 4)
    directory.writeUInt16LE(32, at + 6)
    directory.writeUInt32LE(data.length, at + 8)
    directory.writeUInt32LE(offset, at + 12)
    offset += data.length
  })

  return Buffer.concat([header, directory, ...frames.map((f) => f.data)])
}

const ICO_SIZES = [16, 32, 48]

async function main() {
  await writeFile(join(root, 'src/app/icon.svg'), iconSvg(512))
  console.log('src/app/icon.svg  512x512 svg')

  const apple = await png(180)
  await writeFile(join(root, 'src/app/apple-icon.png'), apple)
  console.log(`src/app/apple-icon.png  180x180  ${(apple.length / 1024).toFixed(1)} kB`)

  const frames = []
  for (const size of ICO_SIZES) frames.push({ size, data: await png(size) })
  const ico = buildIco(frames)
  await writeFile(join(root, 'src/app/favicon.ico'), ico)
  console.log(`src/app/favicon.ico  ${ICO_SIZES.join('/')}  ${(ico.length / 1024).toFixed(1)} kB`)
}

await main()
