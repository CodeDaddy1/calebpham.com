// Encodes every clip on the site for the web and cuts a poster frame from
// each: the home's three chapters and the About band's portrait clip. Run
// after the source files are in ~/Downloads (or SOURCE_DIR):
//
//   node scripts/encode-video.mjs                  everything
//   node scripts/encode-video.mjs --only=posters   just the WebP posters
//   node scripts/encode-video.mjs --chapter=city   one clip
//
// Outputs land in public/video/. Intermediates go to tmp/ (gitignored). The
// originals never enter the repo; the encoded files are meant to be
// committed, and src/lib/home.assets.test.ts holds them to a size. A clip
// with a `phone` block is also encoded at 720p (1280 wide) for viewports
// under 760px, where the band is drawn at a third of the size.
//
// H.264 for Safari and everything else: 1080p, 24 fps for the 30 fps sources
// and native for the 25 fps desk clip and the 24 fps About clip, no audio, a
// two-second GOP so the loop restart and the chapter swap land on keyframes,
// faststart, and a maxrate that guarantees the 4 MB ceiling. VP9 two-pass
// for Chrome, Firefox and Edge, 30 to 40 percent smaller. Posters: one frame
// at each clip's `poster` second, WebP at 1600 and 900 wide.

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

// Board order (src/lib/home.ts CHAPTERS): The City, The Desk, The Code. Then
// the About band's clip (src/lib/clips.ts), a Higgsfield generation of Caleb
// in a Houston office at dusk; its poster is the wide frame at 5.0 s, the
// one with him in it, since that frame is all a phone or a reduced-motion
// visitor sees.
const CLIPS = [
  // vp9: constrained quality. crf is the target, b/maxrate the cap that keeps a
  // detailed clip (the aerial city, the code screen) under the 4 MB ceiling.
  { id: 'city', source: '18126746-uhd_3840_2160_30fps.mp4', fps: 24, trim: null, poster: 1.0, crf: 23, maxrate: '5M', bufsize: '10M', gop: 48, vp9: { b: '4M', maxrate: '4.6M' } },
  { id: 'desk', source: '853844-hd_1920_1080_25fps.mp4', fps: null, trim: 10, poster: 1.0, crf: 24, maxrate: '2.4M', bufsize: '4.8M', gop: 50, vp9: { b: '1.5M', maxrate: '2.4M' } },
  { id: 'code', source: '14519236_3840_2160_60fps.mp4', fps: 24, trim: null, poster: 1.0, crf: 23, maxrate: '5M', bufsize: '10M', gop: 48, vp9: { b: '4M', maxrate: '4.6M' } },
  // Eight seconds at 24 fps: 3.5 Mbps caps the H.264 at 3.5 MB; the phone
  // pair at 1.4 Mbps caps it at 1.4 MB.
  { id: 'about', source: 'hf_20260916_154523_cb8c7612-a566-41bf-a9fc-02260bb2a4ce.mp4', fps: null, trim: null, poster: 5.0, crf: 23, maxrate: '3.5M', bufsize: '7M', gop: 48, vp9: { b: '2.5M', maxrate: '3M' },
    phone: { crf: 23, maxrate: '1.4M', bufsize: '2.8M', vp9: { b: '0.9M', maxrate: '1.1M' } } },
]

/** The encode sizes: 1080 for every clip, 720 for one with a `phone` block. */
const SIZES = { 1080: 1920, 720: 1280 }

const run = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })
const kb = (p) => `${(statSync(p).size / 1024).toFixed(0)} KB`

function scaleFilter(c, size) {
  const scale = `scale=${SIZES[size]}:-2:flags=lanczos`
  return c.fps ? `fps=${c.fps},${scale}` : scale
}

/** The rate settings for a size: the clip's own at 1080, its `phone` block at 720. */
const rates = (c, size) => (size === 720 ? c.phone : c)

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

function mp4(c, src, size) {
  const r = rates(c, size)
  const out = join(OUT, `${c.id}-${size}.mp4`)
  const trim = c.trim ? ['-t', String(c.trim)] : []
  run(['-i', src, ...trim, '-an', '-vf', scaleFilter(c, size),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(r.crf), '-maxrate', r.maxrate, '-bufsize', r.bufsize,
    '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p',
    '-g', String(c.gop), '-keyint_min', String(c.gop), '-sc_threshold', '0', '-movflags', '+faststart', out])
  console.log(`${c.id}-${size}.mp4  ${kb(out)}`)
}

function webm(c, src, size) {
  const r = rates(c, size)
  const out = join(OUT, `${c.id}-${size}.webm`)
  const trim = c.trim ? ['-t', String(c.trim)] : []
  const common = ['-i', src, ...trim, '-an', '-vf', scaleFilter(c, size), '-c:v', 'libvpx-vp9', '-b:v', r.vp9.b, '-maxrate', r.vp9.maxrate, '-crf', '34',
    '-row-mt', '1', '-deadline', 'good', '-cpu-used', '1', '-g', String(c.gop), '-pix_fmt', 'yuv420p',
    '-passlogfile', join(TMP, `${c.id}-${size}-vp9`)]
  run([...common, '-pass', '1', '-f', 'null', '/dev/null'])
  run([...common, '-pass', '2', out])
  console.log(`${c.id}-${size}.webm  ${kb(out)}`)
}

for (const c of CLIPS) {
  if (CHAPTER && c.id !== CHAPTER) continue
  const src = join(SOURCE_DIR, c.source)
  statSync(src)
  if (ONLY === 'all' || ONLY === 'posters') await posters(c, src)
  for (const size of c.phone ? [1080, 720] : [1080]) {
    if (ONLY === 'all' || ONLY === 'mp4') mp4(c, src, size)
    if (ONLY === 'all' || ONLY === 'webm') webm(c, src, size)
  }
}
