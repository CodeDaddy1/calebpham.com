// Encodes the three chapter clips for the web and cuts a poster frame from
// each. Run after the source files are in ~/Downloads (or SOURCE_DIR):
//
//   node scripts/encode-video.mjs                  everything
//   node scripts/encode-video.mjs --only=posters   just the six WebP posters
//   node scripts/encode-video.mjs --chapter=city   one chapter
//
// Outputs land in public/video/. Intermediates go to tmp/ (gitignored). The
// originals never enter the repo; the encoded files are meant to be
// committed, and src/lib/home.assets.test.ts holds them to a size.
//
// H.264 for Safari and everything else: 1080p, 24 fps for the 30 fps sources
// and native 25 for the desk clip, no audio, a two-second GOP so the loop
// restart and the chapter swap land on keyframes, faststart, and a maxrate
// that guarantees the 4 MB ceiling. VP9 two-pass for Chrome, Firefox and
// Edge, 30 to 40 percent smaller. Posters: one frame at 1.0 s, WebP at 1600
// and 900 wide.

import { execFileSync } from 'node:child_process'
import { mkdirSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'

const ROOT = new URL('../', import.meta.url).pathname
const SOURCE_DIR = process.env.SOURCE_DIR ?? join(homedir(), 'Downloads')
const OUT = join(ROOT, 'public/video')
const TMP = join(ROOT, 'tmp/video')
mkdirSync(OUT, { recursive: true })
mkdirSync(TMP, { recursive: true })

const arg = (f) => process.argv.find((a) => a.startsWith(`--${f}=`))?.split('=').slice(1).join('=')
const ONLY = arg('only') ?? 'all'
const CHAPTER = arg('chapter')

// Board order (src/lib/home.ts CHAPTERS): The City, The Desk, The Code.
const CHAPTERS = [
  // vp9: constrained quality. crf is the target, b/maxrate the cap that keeps a
  // detailed clip (the aerial city, the code screen) under the 4 MB ceiling.
  { id: 'city', source: '18126746-uhd_3840_2160_30fps.mp4', fps: 24, trim: null, poster: 1.0, crf: 23, maxrate: '5M', bufsize: '10M', gop: 48, vp9: { b: '4M', maxrate: '4.6M' } },
  { id: 'desk', source: '853844-hd_1920_1080_25fps.mp4', fps: null, trim: 10, poster: 1.0, crf: 24, maxrate: '2.4M', bufsize: '4.8M', gop: 50, vp9: { b: '1.5M', maxrate: '2.4M' } },
  { id: 'code', source: '14519236_3840_2160_60fps.mp4', fps: 24, trim: null, poster: 1.0, crf: 23, maxrate: '5M', bufsize: '10M', gop: 48, vp9: { b: '4M', maxrate: '4.6M' } },
]

const run = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })
const kb = (p) => `${(statSync(p).size / 1024).toFixed(0)} KB`

function scaleFilter(c) {
  return c.fps ? `fps=${c.fps},scale=1920:-2:flags=lanczos` : 'scale=1920:-2:flags=lanczos'
}

async function posters(c, src) {
  const png = join(TMP, `${c.id}.png`)
  run(['-ss', String(c.poster), '-i', src, '-frames:v', '1', '-vf', 'scale=1600:-2:flags=lanczos', png])
  // Step the quality down until the file fits its budget (the asset test
  // holds the 1600 poster to 160 KB and the 900 poster to 70 KB).
  for (const [width, cap] of [[1600, 160 * 1024], [900, 70 * 1024]]) {
    const out = join(OUT, `${c.id}-poster-${width}.webp`)
    for (const quality of [78, 72, 66, 60, 54]) {
      await sharp(png).resize(width).webp({ quality }).toFile(out)
      if (statSync(out).size <= cap) { console.log(`${c.id}-poster-${width}.webp  ${kb(out)}  q${quality}`); break }
    }
  }
}

function mp4(c, src) {
  const out = join(OUT, `${c.id}-1080.mp4`)
  const trim = c.trim ? ['-t', String(c.trim)] : []
  run(['-i', src, ...trim, '-an', '-vf', scaleFilter(c),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(c.crf), '-maxrate', c.maxrate, '-bufsize', c.bufsize,
    '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p',
    '-g', String(c.gop), '-keyint_min', String(c.gop), '-sc_threshold', '0', '-movflags', '+faststart', out])
  console.log(`${c.id}-1080.mp4  ${kb(out)}`)
}

function webm(c, src) {
  const out = join(OUT, `${c.id}-1080.webm`)
  const trim = c.trim ? ['-t', String(c.trim)] : []
  const common = ['-i', src, ...trim, '-an', '-vf', scaleFilter(c), '-c:v', 'libvpx-vp9', '-b:v', c.vp9.b, '-maxrate', c.vp9.maxrate, '-crf', '34',
    '-row-mt', '1', '-deadline', 'good', '-cpu-used', '1', '-g', String(c.gop), '-pix_fmt', 'yuv420p',
    '-passlogfile', join(TMP, `${c.id}-vp9`)]
  run([...common, '-pass', '1', '-f', 'null', '/dev/null'])
  run([...common, '-pass', '2', out])
  console.log(`${c.id}-1080.webm  ${kb(out)}`)
}

for (const c of CHAPTERS) {
  if (CHAPTER && c.id !== CHAPTER) continue
  const src = join(SOURCE_DIR, c.source)
  statSync(src)
  if (ONLY === 'all' || ONLY === 'posters') await posters(c, src)
  if (ONLY === 'all' || ONLY === 'mp4') mp4(c, src)
  if (ONLY === 'all' || ONLY === 'webm') webm(c, src)
}
