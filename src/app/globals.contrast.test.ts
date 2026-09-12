// Contrast floor for the design tokens.
//
// Every colour token that can carry text is measured against BOTH surfaces it
// can land on (the card and the page) because a token that clears 4.5:1 on
// one and fails on the other fails silently: the build is green, the types
// are fine, and the copy is simply hard to read on half the pages.
//
// This is a port of LumaIQ's gate, which exists because a muted token shipped
// at 2.78:1 across 610 call sites and nothing caught it. Here it also measures
// each case study's swatch block, the glass panel over the brightest frame the
// home video can show, the print palette on paper, and pins the literal
// palettes inside the OG card and the icon script, which cannot read CSS
// variables.
//
// WHAT BREAKS IF THIS IS WRONG: a hiring manager on a phone in daylight cannot
// read the line that says what you built. The failure is not a crash. It is a
// paragraph nobody finishes.
//
// If a token has to change, change it and re-run this. Do not relax the floor.

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PROJECTS } from '@/lib/projects'

const CSS = readFileSync(fileURLToPath(new URL('./globals.css', import.meta.url)), 'utf-8')
const CINEMA_PATH = fileURLToPath(new URL('./cinema.css', import.meta.url))
const CINEMA = existsSync(CINEMA_PATH) ? readFileSync(CINEMA_PATH, 'utf-8') : ''
const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '')

/** WCAG 2.1 AA for normal-size text, and the floor for a control's boundary. */
const AA_NORMAL = 4.5
const AA_NON_TEXT = 3

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

  it('the accent-on ink clears AA on the accent fill and its hover (primary pill, skip link)', () => {
    const on = hexToRgb(root['--accent-on'])
    expect(contrast(on, hexToRgb(root['--accent']))).toBeGreaterThanOrEqual(AA_NORMAL)
    expect(contrast(on, hexToRgb(root['--accent-hover']))).toBeGreaterThanOrEqual(AA_NORMAL)
  })

  it('the control boundary clears the non-text floor on the page', () => {
    const page = hexToRgb(root['--background'])
    const edge = resolve(root['--border-control'], page)
    expect(contrast(edge, page)).toBeGreaterThanOrEqual(AA_NON_TEXT)
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

  it('chalk is readable on the ground', () => {
    expect(contrast(hexToRgb(s['--nr-chalk']), page)).toBeGreaterThanOrEqual(AA_NORMAL)
  })

  it('the on-yellow ink is readable on the yellow fill', () => {
    // --foreground is light and measures 1.12 on the yellow; a marker needs
    // its own dark ink.
    const yellow = hexToRgb(s['--nr-yellow'])
    expect(contrast(hexToRgb(s['--nr-on-yellow']), yellow)).toBeGreaterThanOrEqual(AA_NORMAL)
  })
})

describe('the glass panel over the brightest frame the video can show', () => {
  // The home video is footage nobody measured; the worst case under the glass
  // is a white frame. The panel is measured over that, not over the ground.
  const glass = resolve(root['--glass'], [255, 255, 255])

  for (const token of ['--foreground', '--muted-strong'] as const) {
    it(`${token} on the glass clears AA`, () => {
      const ratio = contrast(hexToRgb(root[token]), glass)
      expect(ratio, `${token} on the glass over white is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_NORMAL)
    })
  }

  it('--muted does NOT, which is why .glass re-scopes --muted to --muted-strong', () => {
    expect(contrast(hexToRgb(root['--muted']), glass)).toBeLessThan(AA_NORMAL)
    if (CINEMA) expect(stripComments(CINEMA)).toMatch(/^\.glass\s*\{[^}]*--muted:\s*var\(--muted-strong\);/m)
  })
})

describe('the pre-reveal word colour', () => {
  it('is not a text token and only applies while JavaScript has armed the statement', () => {
    expect(TEXT_TOKENS as readonly string[]).not.toContain('--word-unlit')
    const rules = [...stripComments(CSS + '\n' + CINEMA).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter((m) => m[2].includes('var(--word-unlit)'))
      .map((m) => m[1].trim())
    for (const sel of rules) expect(sel, `${sel} paints --word-unlit outside the armed statement`).toMatch(/^\[data-statement-ready\]/)
    // The reduced-motion block never arms the statement, so it never sets it either.
    const reduced = stripComments(CSS + '\n' + CINEMA).match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g) ?? []
    for (const block of reduced) expect(block).not.toContain('--word-unlit')
  })
})

describe('the print palette is a paper document', () => {
  it('overrides the tokens on :root, not on a weaker selector', () => {
    const block = CSS.slice(CSS.indexOf('@media print'))
    expect(block).toMatch(/\n  :root\s*\{[^}]*--foreground:/)
    expect(block).not.toMatch(/\n  html\s*\{[^}]*--foreground:/)
  })

  const at = CSS.indexOf('@media print')
  // The print block redefines the tokens on an indented :root (same specificity
  // as the screen block, later in the file). A type selector would lose to :root.
  const print = tokenBlock('  :root', CSS.slice(at))
  const paper = hexToRgb(print['--background'])

  for (const token of ['--foreground', '--muted-strong', '--muted'] as const) {
    it(`${token} in print clears AA on paper`, () => {
      const ratio = contrast(resolve(print[token], paper), paper)
      expect(ratio, `print ${token} is ${ratio.toFixed(2)}:1 on paper`).toBeGreaterThanOrEqual(AA_NORMAL)
    })
  }
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
