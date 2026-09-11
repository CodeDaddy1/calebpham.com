// Contrast floor for the design tokens.
//
// Every colour token that can carry text is measured against BOTH surfaces it
// can land on (the card and the page) because a token that clears 4.5:1 on
// one and fails on the other fails silently: the build is green, the types
// are fine, and the copy is simply hard to read on half the pages.
//
// This is a port of LumaIQ's gate, which exists because a muted token shipped
// at 2.78:1 across 610 call sites and nothing caught it. Here it also measures
// each case study's swatch block and pins the literal palette inside the OG
// card, which cannot read CSS variables.
//
// WHAT BREAKS IF THIS IS WRONG: a hiring manager on a phone in daylight cannot
// read the line that says what you built. The failure is not a crash. It is a
// paragraph nobody finishes.
//
// If a token has to change, change it and re-run this. Do not relax the floor.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PROJECTS } from '@/lib/projects'

const CSS = readFileSync(fileURLToPath(new URL('./globals.css', import.meta.url)), 'utf-8')

/** WCAG 2.1 AA for normal-size text. */
const AA_NORMAL = 4.5

type RGB = [number, number, number]

/**
 * Pull one `selector { … }` block out of the stylesheet. Anchored to the start
 * of a line so a selector name inside a comment or an at-rule cannot match.
 */
function tokenBlock(selector: string): Record<string, string> {
  const m = CSS.match(new RegExp(`^${selector}\\s*(?:,[^{]*)?\\{([\\s\\S]*?)\\n\\}`, 'm'))
  if (!m) throw new Error(`no ${selector} block in globals.css`)
  const out: Record<string, string> = {}
  for (const d of m[1].matchAll(/(--[a-z-]+):\s*([^;]+);/g)) out[d[1]] = d[2].trim()
  return out
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB
}

/** Resolve a token to concrete pixels. An rgba() token is composited over the
 *  surface first; the alpha is the whole reason tints fail. */
function resolve(value: string, over: RGB): RGB {
  if (value.startsWith('#')) return hexToRgb(value)
  const m = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/)
  if (!m) throw new Error(`cannot parse colour: ${value}`)
  const fg = [+m[1], +m[2], +m[3]] as RGB
  const a = m[4] === undefined ? 1 : +m[4]
  return fg.map((c, i) => Math.round(c * a + over[i] * (1 - a))) as RGB
}

function luminance([r, g, b]: RGB): number {
  const lin = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const root = tokenBlock(':root')
const surfaces: [string, RGB][] = [
  ['card', hexToRgb(root['--card'])],
  ['page', hexToRgb(root['--background'])],
]

/** Tokens that are rendered as text somewhere on the site. */
const TEXT_TOKENS = [
  '--foreground',
  '--muted-strong',
  '--muted',
  '--accent',
  '--code-keyword',
  '--code-string',
  '--code-comment',
  '--code-function',
  '--code-constant',
  '--code-punctuation',
] as const

describe('text tokens', () => {
  for (const token of TEXT_TOKENS) {
    for (const [surfaceName, surface] of surfaces) {
      it(`${token} on the ${surfaceName} clears AA`, () => {
        const ratio = contrast(resolve(root[token], surface), surface)
        expect(ratio, `${token} on ${surfaceName} is ${ratio.toFixed(2)}:1, needs ${AA_NORMAL}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
      })
    }
  }

  // An accent is very often set as text on its OWN tint (a label on a chip, a
  // callout eyebrow). That tint is a third surface, and it is the one an
  // accent fails on first.
  for (const [surfaceName, surface] of surfaces) {
    it(`--accent stays readable on its own tint over the ${surfaceName}`, () => {
      const tint = resolve(root['--accent-soft'], surface)
      const ratio = contrast(resolve(root['--accent'], tint), tint)
      expect(ratio, `--accent on --accent-soft over ${surfaceName} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
    })
  }

  it('keeps a visible step between muted and muted-strong', () => {
    // Both passing AA is not enough: if they converge, the two-tier secondary
    // text hierarchy stops reading as a hierarchy.
    const card = hexToRgb(root['--card'])
    const muted = contrast(resolve(root['--muted'], card), card)
    const strong = contrast(resolve(root['--muted-strong'], card), card)
    expect(strong / muted).toBeGreaterThanOrEqual(1.3)
  })

  it('white label on the accent fill clears AA (primary pill)', () => {
    expect(contrast([255, 255, 255], hexToRgb(root['--accent']))).toBeGreaterThanOrEqual(AA_NORMAL)
    expect(contrast([255, 255, 255], hexToRgb(root['--accent-hover']))).toBeGreaterThanOrEqual(AA_NORMAL)
  })
})

// Each case study's swatch block is keyed by its route slug, so the index and
// the CSS cannot drift: a project without a block fails here by name.
describe.each(PROJECTS.map((p) => p.slug))('swatch %s', (slug) => {
  const s = tokenBlock(String.raw`\[data-swatch='${slug}'\]`)

  for (const [surfaceName, surface] of surfaces) {
    it(`--swatch-ink on the ${surfaceName} clears AA`, () => {
      const ratio = contrast(resolve(s['--swatch-ink'], surface), surface)
      expect(ratio, `${slug} ink on ${surfaceName} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
    })

    it(`--swatch-ink on --swatch-soft over the ${surfaceName} clears AA`, () => {
      const tint = resolve(s['--swatch-soft'], surface)
      const ratio = contrast(resolve(s['--swatch-ink'], tint), tint)
      expect(ratio, `${slug} ink on its tint over ${surfaceName} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
    })
  }

  it('--swatch-on against --swatch clears AA', () => {
    const fill = hexToRgb(s['--swatch'])
    const ratio = contrast(resolve(s['--swatch-on'], fill), fill)
    expect(ratio, `${slug} on-colour against the fill is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
  })
})

describe('the Ninth Room extras', () => {
  const s = tokenBlock(String.raw`\[data-swatch='the-ninth-room'\]`)
  const page = hexToRgb(root['--background'])

  it('chalk is readable on navy', () => {
    const navy = hexToRgb(s['--swatch'])
    expect(contrast(hexToRgb(s['--nr-chalk']), navy)).toBeGreaterThanOrEqual(AA_NORMAL)
  })

  it('ink is readable on the yellow fill', () => {
    const yellow = hexToRgb(s['--nr-yellow'])
    expect(contrast(hexToRgb(root['--foreground']), yellow)).toBeGreaterThanOrEqual(AA_NORMAL)
  })

  it('yellow on paper is BELOW the floor, which is why it is never ink', () => {
    // A deliberate assertion that documents the rule. If a future yellow ever
    // clears the floor, this test says so and the rule can be revisited on
    // purpose rather than by accident.
    expect(contrast(hexToRgb(s['--nr-yellow']), page)).toBeLessThan(AA_NORMAL)
  })
})

describe('the OG card keeps its frozen palette in sync', () => {
  // src/lib/og-image.tsx hardcodes literal colours because Satori cannot read
  // CSS custom properties. That is correct, and it means the card silently
  // falls behind globals.css unless something compares them.
  const src = readFileSync(fileURLToPath(new URL('../lib/og-image.tsx', import.meta.url)), 'utf-8')
  const strip = (s: string) => s.replace(/\s+/g, '').toLowerCase()

  const EXPECTED: [string, string][] = [
    ['INK', root['--foreground']],
    ['MUTED', root['--muted']],
    ['ACCENT', root['--accent']],
    ['PAGE', root['--background']],
    ['CARD', root['--card']],
    ['BORDER', root['--border']],
  ]

  for (const [name, tokenValue] of EXPECTED) {
    it(`${name} matches the token`, () => {
      const m = src.match(new RegExp(`const ${name} = '([^']+)'`))
      expect(m, `og-image.tsx has no \`const ${name}\``).toBeTruthy()
      expect(strip(m![1]), `og-image.tsx ${name} is ${m![1]} but the token is ${tokenValue}`).toBe(strip(tokenValue))
    })
  }
})
