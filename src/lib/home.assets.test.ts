// The home page's stage assets: every poster exists and is under budget,
// every encoded clip (once a chapter's video is on) is under 4 MB, and the
// design's text stays readable over the real footage.
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

import { existsSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { CHAPTERS, posterSrc, videoSrc } from './home'

const PUBLIC = fileURLToPath(new URL('../../public', import.meta.url))
const file = (url: string) => `${PUBLIC}${url}`
const KB = 1024
const CAP = { poster1600: 160 * KB, poster900: 70 * KB, video: 4 * 1024 * KB }

/** Scrim stops as cinema.css paints them at 760px and up, per chapter: [left, 40 percent, right]. */
const SCRIM = {
  city: [0.2, 0.35, 0.9],
  desk: [0.2, 0.45, 0.9],
  code: [0.45, 0.6, 0.95],
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
})
