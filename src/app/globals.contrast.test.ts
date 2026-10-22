// Contrast floor for the design tokens.
//
// Every colour token that can carry text is measured against BOTH surfaces it
// can land on (the card and the page) because a token that clears 4.5:1 on
// one and fails on the other fails silently: the build is green, the types
// are fine, and the copy is simply hard to read on half the page.
//
// This is a port of LumaIQ's gate, which exists because a muted token shipped
// at 2.78:1 across 610 call sites and nothing caught it. Here it also pins
// the literal palettes inside the OG card and the icon script, which cannot
// read CSS variables.
//
// WHAT BREAKS IF THIS IS WRONG: a storage owner on a phone in daylight cannot
// read the line that says what LumaIQ does. The failure is not a crash. It is
// a paragraph nobody finishes.
//
// If a token has to change, change it and re-run this. Do not relax the floor.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const CSS = readFileSync(fileURLToPath(new URL('./globals.css', import.meta.url)), 'utf-8')

/** WCAG 2.1 AA for normal-size text. */
const AA_NORMAL = 4.5

type RGB = [number, number, number]

/**
 * Pull one `selector { … }` block out of the stylesheet. Anchored to the start
 * of a line so a selector name inside a comment or an at-rule cannot match.
 */
function tokenBlock(selector: string, css = CSS): Record<string, string> {
  const m = css.match(new RegExp(`^${selector}\\s*(?:,[^{]*)?\\{([\\s\\S]*?)\\n\\}`, 'm'))
  if (!m) throw new Error(`no ${selector} block`)
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
const TEXT_TOKENS = ['--foreground', '--muted-strong', '--muted', '--accent'] as const

describe('text tokens', () => {
  for (const token of TEXT_TOKENS) {
    for (const [surfaceName, surface] of surfaces) {
      it(`${token} on the ${surfaceName} clears AA`, () => {
        const ratio = contrast(resolve(root[token], surface), surface)
        expect(ratio, `${token} on ${surfaceName} is ${ratio.toFixed(2)}:1, needs ${AA_NORMAL}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
      })
    }
  }

  // The accent is set as text on its OWN tint (the Demo data chip on every
  // screen frame). That tint is a third surface, and it is the one an accent
  // fails on first.
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

  it('the accent-on ink clears AA on the accent fill and its hover (every button, the skip link)', () => {
    const on = hexToRgb(root['--accent-on'])
    expect(contrast(on, hexToRgb(root['--accent']))).toBeGreaterThanOrEqual(AA_NORMAL)
    expect(contrast(on, hexToRgb(root['--accent-hover']))).toBeGreaterThanOrEqual(AA_NORMAL)
  })
})

describe('the OG card and the icon script keep their frozen palettes in sync', () => {
  // src/lib/og-image.tsx and scripts/generate-icons.mjs hardcode literal
  // colours because neither can read CSS custom properties. That is correct,
  // and it means they silently fall behind globals.css unless something
  // compares them.
  const og = readFileSync(fileURLToPath(new URL('../lib/og-image.tsx', import.meta.url)), 'utf-8')
  const icons = readFileSync(fileURLToPath(new URL('../../scripts/generate-icons.mjs', import.meta.url)), 'utf-8')
  const strip = (s: string) => s.replace(/\s+/g, '').toLowerCase()

  const EXPECTED: [string, string, string][] = [
    ['og-image.tsx', 'INK', root['--foreground']],
    ['og-image.tsx', 'MUTED', root['--muted']],
    ['og-image.tsx', 'MUTED_STRONG', root['--muted-strong']],
    ['og-image.tsx', 'ACCENT', root['--accent']],
    ['og-image.tsx', 'ACCENT_ON', root['--accent-on']],
    ['og-image.tsx', 'PAGE', root['--background']],
    ['og-image.tsx', 'CARD', root['--card']],
    ['og-image.tsx', 'BORDER', root['--border']],
    ['generate-icons.mjs', 'GROUND', root['--background']],
    ['generate-icons.mjs', 'MARK', root['--accent']],
  ]

  for (const [file, name, tokenValue] of EXPECTED) {
    it(`${file} ${name} matches the token`, () => {
      const src = file === 'og-image.tsx' ? og : icons
      const m = src.match(new RegExp(`const ${name} = '([^']+)'`))
      expect(m, `${file} has no \`const ${name}\``).toBeTruthy()
      expect(strip(m![1]), `${file} ${name} is ${m![1]} but the token is ${tokenValue}`).toBe(strip(tokenValue))
    })
  }
})
