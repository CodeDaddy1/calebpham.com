// The product screens on the page and the files behind them agree.
//
// scripts/encode-screens.mjs names each file by its content and lists it in
// screens.json; the page reads only the manifest. A retake under an old name
// kept serving the old picture from next/image's cache on 2026-10-21, which
// is why names carry the hash.
//
// WHAT BREAKS IF THIS IS WRONG: a job shows a broken image, a stale screen,
// or the manifest's size disagrees with the file and the frame reserves the
// wrong height while the picture loads.

import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { JOBS } from './page'
import SCREENS from './screens.json'

const PUBLIC = fileURLToPath(new URL('../../public', import.meta.url))

describe('screens.json', () => {
  const entries = Object.values(SCREENS).flatMap((s) => [s.desktop, s.phone])

  it('has a desktop and a phone file for every job on the page', () => {
    for (const job of JOBS.items) {
      expect(SCREENS[job.screen.name], job.screen.name).toBeDefined()
    }
  })

  it('names content-hashed files that exist, at the sizes it states', async () => {
    for (const e of entries) {
      expect(e.src).toMatch(/^\/screens\/[a-z-]+-(desktop|phone)-[0-9a-f]{8}\.webp$/)
      expect(existsSync(`${PUBLIC}${e.src}`), e.src).toBe(true)
      const { width, height } = await sharp(`${PUBLIC}${e.src}`).metadata()
      expect([width, height], e.src).toEqual([e.width, e.height])
    }
  })

  it('leaves no file in public/screens that the manifest does not name', () => {
    const named = new Set(entries.map((e) => e.src.replace('/screens/', '')))
    expect(readdirSync(`${PUBLIC}/screens`).filter((f) => !named.has(f))).toEqual([])
  })
})
