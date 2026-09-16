// The site's footage: every poster exists and is under budget, every encoded
// clip (once a chapter's video is on, and the About band's) is under 4 MB,
// and the design's text stays readable over the real footage.
//
// That last one is the measurement nothing else can make. The rendered-DOM
// contrast sweep walks ancestors, and the video is a fixed sibling layer, so
// it never sees it; the token test measures inks on the ground, not on a
// frame. So this reads each poster's pixels, composites the scrim exactly as
// cinema.css paints it (0.2 black at the left, 0.35 at 40 percent, 0.9 at the
// right; darker again in chapter 2 with the 0.8 brightness filter), takes
// the 95th-percentile luminance inside the text column (the right 50 percent
// of the frame, 40 to 90 percent down, where the 640px column sits at
// 1280px), and asserts #EDEDED clears 4.5:1 against it.
//
// WHAT BREAKS IF THIS IS WRONG: a bright sky behind the headline. The fix is
// the scrim's 40 percent stop or a different frame, never a lighter ink.

import { existsSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { CHAPTERS } from './home'
import { posterSrc, videoSrc } from './clips'
import { BANNERS, bannerSrc, type BannerSlug } from './banners'

const PUBLIC = fileURLToPath(new URL('../../public', import.meta.url))
const file = (url: string) => `${PUBLIC}${url}`
const KB = 1024
const CAP = { poster1600: 160 * KB, poster900: 70 * KB, video: 4 * 1024 * KB, phone: 1.5 * 1024 * KB }

/** Scrim stops as cinema.css paints them at 760px and up, per chapter: [left, 40 percent, right]. */
const SCRIM = {
  city: [0.2, 0.35, 0.9],
  desk: [0.2, 0.45, 0.9],
  code: [0.3, 0.45, 0.85],
} as const
/** The chapter-2 stage filter darkens the frame before the scrim. */
const BRIGHTNESS = { city: 1, desk: 1, code: 0.8 } as const
const INK = [0xed, 0xed, 0xed] as const
const AA_NORMAL = 4.5

const lin = (c: number) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
const INK_LUM = luminance(...INK)

function scrimAlpha(x: number, stops: readonly [number, number, number]): number {
  const [s0, s1, s2] = stops
  return x <= 0.4 ? s0 + (s1 - s0) * (x / 0.4) : s1 + (s2 - s1) * ((x - 0.4) / 0.6)
}

/** 95th-percentile luminance of the text column after the scrim and filter. */
async function worstLuminance(path: string, stops: readonly [number, number, number], brightness: number): Promise<number> {
  const { data, info } = await sharp(path).resize(400).raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const lums: number[] = []
  for (let y = Math.floor(height * 0.4); y < Math.floor(height * 0.9); y++) {
    for (let x = Math.floor(width * 0.48); x < Math.floor(width * 0.98); x++) {
      const i = (y * width + x) * channels
      const keep = 1 - scrimAlpha(x / width, stops)
      const r = Math.min(255, data[i] * brightness) * keep
      const g = Math.min(255, data[i + 1] * brightness) * keep
      const b = Math.min(255, data[i + 2] * brightness) * keep
      lums.push(luminance(r, g, b))
    }
  }
  lums.sort((a, b) => a - b)
  return lums[Math.floor(lums.length * 0.95)]
}

/** The inner-page band: the whole frame under the flat --band-scrim (0.76 of #0B0B0B). */
async function worstUnderFlatScrim(path: string, alpha: number): Promise<number> {
  const { data, info } = await sharp(path).resize(400).raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const lums: number[] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels
      const keep = 1 - alpha
      lums.push(luminance(data[i] * keep + 11 * alpha, data[i + 1] * keep + 11 * alpha, data[i + 2] * keep + 11 * alpha))
    }
  }
  lums.sort((a, b) => a - b)
  return lums[Math.floor(lums.length * 0.95)]
}

describe('the inner-page band', () => {
  // src/components/page-band.tsx puts the label, heading and lede over the
  // city poster under --band-scrim; the lede is --muted-strong, so both inks
  // are measured against the brightest five percent of the whole frame.
  const BAND_ALPHA = 0.76
  const MUTED_STRONG = [0xc9, 0xc9, 0xc9] as const
  it('keeps the heading and the lede readable over the city poster', async () => {
    const worst = await worstUnderFlatScrim(file(posterSrc('city', 900)), BAND_ALPHA)
    const ink = contrast(INK_LUM, worst)
    const lede = contrast(luminance(...MUTED_STRONG), worst)
    expect(ink, `#EDEDED on the band is ${ink.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
    expect(lede, `#C9C9C9 on the band is ${lede.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
  })
  it('matches the alpha globals.css declares', () => {
    const css = readFileSync(fileURLToPath(new URL('../app/globals.css', import.meta.url)), 'utf-8')
    const m = css.match(/--band-scrim:\s*rgba\(11, 11, 11, ([\d.]+)\)/)
    expect(m, '--band-scrim must be rgba(11, 11, 11, a)').toBeTruthy()
    expect(Number(m![1])).toBe(BAND_ALPHA)
  })
})

describe('the inner-page banners (src/lib/banners.ts)', () => {
  // Each committed Pexels photo sits under the same flat scrim as the city
  // poster; the heading is --foreground and the lede --muted-strong.
  const BAND_ALPHA = 0.76
  const MUTED_STRONG = [0xc9, 0xc9, 0xc9] as const
  const slugs = Object.keys(BANNERS) as BannerSlug[]

  it('has a banner for every inner page', () => {
    expect(slugs.sort()).toEqual(['about', 'lumaiq', 'mdcb-study', 'not-found', 'resume', 'the-ninth-room', 'work'])
  })

  describe.each(slugs)('%s', (slug) => {
    it('has both files, under budget', () => {
      const big = file(bannerSrc(slug, 1600))
      const small = file(bannerSrc(slug, 900))
      expect(existsSync(big), `${big} is missing: node --env-file=tmp/.env.pexels scripts/fetch-banners.mjs`).toBe(true)
      expect(existsSync(small)).toBe(true)
      expect(statSync(big).size).toBeLessThanOrEqual(CAP.poster1600)
      expect(statSync(small).size).toBeLessThanOrEqual(CAP.poster900)
    })

    it('keeps the heading and the lede readable under the scrim', async () => {
      const worst = await worstUnderFlatScrim(file(bannerSrc(slug, 900)), BAND_ALPHA)
      const ink = contrast(INK_LUM, worst)
      const lede = contrast(luminance(...MUTED_STRONG), worst)
      expect(ink, `#EDEDED on the ${slug} banner is ${ink.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
      expect(lede, `#C9C9C9 on the ${slug} banner is ${lede.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
    })
  })
})

describe('the About band clip', () => {
  // src/app/(site)/about/page.tsx plays the About clip behind its band under
  // --band-scrim-video, darker than the page band's scrim to hide the
  // generated clip's flaws. The poster is the 5.0 s frame; the brightest of
  // 32 frames sampled across the clip measured 8.9:1 for #EDEDED under the
  // lighter 0.76 scrim on 2026-09-16, so the frame stands for the clip.
  const VIDEO_ALPHA = 0.84
  const MUTED_STRONG = [0xc9, 0xc9, 0xc9] as const

  it('has both posters, under budget', () => {
    const big = file(posterSrc('about', 1600))
    const small = file(posterSrc('about', 900))
    expect(existsSync(big), `${big} is missing: node scripts/encode-video.mjs --chapter=about`).toBe(true)
    expect(existsSync(small)).toBe(true)
    expect(statSync(big).size).toBeLessThanOrEqual(CAP.poster1600)
    expect(statSync(small).size).toBeLessThanOrEqual(CAP.poster900)
  })

  it('has both encodes under 4 MB', () => {
    for (const ext of ['mp4', 'webm'] as const) {
      const path = file(videoSrc('about', ext))
      expect(existsSync(path), `${path} is missing: node scripts/encode-video.mjs --chapter=about`).toBe(true)
      expect(statSync(path).size, `${path} is over 4 MB`).toBeLessThanOrEqual(CAP.video)
    }
  })

  // The band plays on phones (band-video.tsx passes `phones` to the gate),
  // where the band is a third of the size, so under 760px it fetches the
  // 720 pair the encoder's `phone` block makes.
  it('has both phone encodes under 1.5 MB', () => {
    for (const ext of ['mp4', 'webm'] as const) {
      const path = file(videoSrc('about', ext, 720))
      expect(existsSync(path), `${path} is missing: node scripts/encode-video.mjs --chapter=about`).toBe(true)
      expect(statSync(path).size, `${path} is over 1.5 MB`).toBeLessThanOrEqual(CAP.phone)
    }
  })

  it('keeps the heading and the lede readable under the video scrim', async () => {
    const worst = await worstUnderFlatScrim(file(posterSrc('about', 900)), VIDEO_ALPHA)
    const ink = contrast(INK_LUM, worst)
    const lede = contrast(luminance(...MUTED_STRONG), worst)
    expect(ink, `#EDEDED on the About band is ${ink.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
    expect(lede, `#C9C9C9 on the About band is ${lede.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
  })

  it('matches the alpha globals.css declares, darker than the page band', () => {
    const css = readFileSync(fileURLToPath(new URL('../app/globals.css', import.meta.url)), 'utf-8')
    const m = css.match(/--band-scrim-video:\s*rgba\(11, 11, 11, ([\d.]+)\)/)
    expect(m, '--band-scrim-video must be rgba(11, 11, 11, a)').toBeTruthy()
    expect(Number(m![1])).toBe(VIDEO_ALPHA)
    const band = css.match(/--band-scrim:\s*rgba\(11, 11, 11, ([\d.]+)\)/)
    expect(Number(m![1])).toBeGreaterThan(Number(band![1]))
  })
})

describe.each(CHAPTERS)('chapter $id', (c) => {
  it('has both posters, under budget', () => {
    const big = file(posterSrc(c.id, 1600))
    const small = file(posterSrc(c.id, 900))
    expect(existsSync(big), `${big} is missing: node scripts/encode-video.mjs --only=posters`).toBe(true)
    expect(existsSync(small)).toBe(true)
    expect(statSync(big).size).toBeLessThanOrEqual(CAP.poster1600)
    expect(statSync(small).size).toBeLessThanOrEqual(CAP.poster900)
  })

  it("keeps the headline ink readable over the frame under its chapter's scrim", async () => {
    const worst = await worstLuminance(file(posterSrc(c.id, 900)), SCRIM[c.id], BRIGHTNESS[c.id])
    const ratio = contrast(INK_LUM, worst)
    expect(ratio, `#EDEDED over the ${c.id} frame's text column is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
  })

  it('keeps it readable under the lightest scrim too, for the moment of a chapter swap', async () => {
    const worst = await worstLuminance(file(posterSrc(c.id, 900)), SCRIM.city, 1)
    const ratio = contrast(INK_LUM, worst)
    // The desk frame is the known exception: it is only ever shown in its own chapter.
    if (c.id === 'desk') expect(ratio).toBeGreaterThanOrEqual(4.2)
    else expect(ratio, `#EDEDED over the ${c.id} frame under the city stops is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
  })

  it('has both encodes under 4 MB when its video is on', () => {
    if (!c.video) return
    for (const ext of ['mp4', 'webm'] as const) {
      const path = file(videoSrc(c.id, ext))
      expect(existsSync(path), `${path} is missing: node scripts/encode-video.mjs --chapter=${c.id}`).toBe(true)
      expect(statSync(path).size, `${path} is over 4 MB`).toBeLessThanOrEqual(CAP.video)
    }
  })

  // The stage plays on phones too (stage.tsx passes `phones` to the gate)
  // and fetches the 720 pair under 760px.
  it('has both phone encodes under 1.5 MB when its video is on', () => {
    if (!c.video) return
    for (const ext of ['mp4', 'webm'] as const) {
      const path = file(videoSrc(c.id, ext, 720))
      expect(existsSync(path), `${path} is missing: node scripts/encode-video.mjs --chapter=${c.id} --size=720`).toBe(true)
      expect(statSync(path).size, `${path} is over 1.5 MB`).toBeLessThanOrEqual(CAP.phone)
    }
  })
})
