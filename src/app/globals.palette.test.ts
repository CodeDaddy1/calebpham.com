// A colour that carries meaning must come from a token, not from Tailwind's
// stock palette.
//
// WHY THIS EXISTS: globals.contrast.test.ts is the AA floor, and it measures
// the tokens declared in globals.css and nothing else. A className written as
// `text-rose-700` therefore passes every gate in this repo while being, in
// fact, an unmeasured colour decision. LumaIQ found 337 of them across 35
// files, one at 4.44:1 on a pill a district manager reads at a counter.
//
// The same sweep found the tint alpha was the other unmeasured half. A wash
// written as `bg-[var(--accent)]/15` lifts the surface under the ink, and 15%
// is exactly where an accent stops clearing AA. So tints are declared as
// `-soft` tokens at the widest alpha their ink survives, and a call site picks
// a token rather than an opacity.
//
// The last block guards the flat look: LumaIQ's design draws every surface
// with hairlines, so nothing on the site blurs, glows, fades in a gradient,
// or casts a shadow.
//
// WHAT BREAKS IF THIS IS WRONG: nothing visible, which is the problem. The
// build stays green, the contrast suite stays green, and unreadable copy ships
// on whichever element happened to be written by hand.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = fileURLToPath(new URL('../', import.meta.url))
const CSS = readFileSync(fileURLToPath(new URL('./globals.css', import.meta.url)), 'utf-8')

const HUES = [
  'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow',
  'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
  'purple', 'fuchsia', 'pink', 'rose',
].join('|')

/** `text-rose-700`, `hover:bg-amber-400/15`, `border-sky-200`. */
const PALETTE_CLASS = new RegExp(
  String.raw`(?<![\w-])(?:[a-z-]+:)*(?:text|bg|border|ring|divide|outline|fill|stroke|decoration|from|via|to|shadow|accent|caret)-(?:${HUES})-\d{2,3}(?:/(?:\d{1,3}|\[[\d.]+\]))?(?![\w-])`,
  'g',
)

/** Files where a literal colour or class name is the point. */
const EXEMPT = [
  'globals.palette.test.ts',
  'globals.contrast.test.ts',
  'globals.tokens.test.ts',
  'globals.light-only.test.ts',
]

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(tsx|ts|mdx|css)$/.test(entry)) out.push(full)
  }
  return out
}

/** Prose discusses class names in order to explain why they went away. */
const stripComments = (t: string) =>
  t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

const files = () => walk(SRC).filter((f) => !EXEMPT.some((e) => f.endsWith(e)))

describe('semantic colour comes from tokens', () => {
  it('no raw Tailwind palette class outside the stated exemptions', () => {
    const found: string[] = []
    for (const file of files()) {
      const lines = stripComments(readFileSync(file, 'utf-8')).split('\n')
      lines.forEach((line, i) => {
        const hits = line.match(PALETTE_CLASS)
        if (hits) found.push(`${file.slice(SRC.length)}:${i + 1} → ${hits.join(' ')}`)
      })
    }
    expect(found, `use a token from globals.css instead:\n${found.join('\n')}`).toEqual([])
  })
})

describe('every ink has a declared tint', () => {
  it('--accent-soft is declared exactly once (one theme)', () => {
    expect((CSS.match(/--accent-soft\s*:/g) ?? []).length).toBe(1)
  })

  it('no className sets an ink on a hand-picked wash of itself', () => {
    const offenders: string[] = []
    for (const file of files()) {
      const lines = stripComments(readFileSync(file, 'utf-8')).split('\n')
      lines.forEach((line, i) => {
        for (const m of line.matchAll(/bg-\[var\(--accent\)\]\/\d+/g)) {
          if (line.includes('text-[var(--accent)]')) offenders.push(`${file.slice(SRC.length)}:${i + 1} → ${m[0]} under its own ink`)
        }
      })
    }
    expect(offenders, `use the -soft token instead:\n${offenders.join('\n')}`).toEqual([])
  })
})

/** `selector { body }` pairs; a rule nested in an at-rule parses to its own selector. */
function rules(css: string): { selector: string; body: string }[] {
  return [...stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }))
}

describe('refused effects stay refused', () => {
  const globalRules = rules(CSS)

  it('globals.css carries no blur, glow, gradient, or shadow', () => {
    for (const banned of ['backdrop-filter', 'blur(', 'linear-gradient', 'radial-gradient', 'box-shadow', 'drop-shadow']) {
      const hits = globalRules.filter((r) => r.body.includes(banned)).map((r) => r.selector)
      expect(hits, `globals.css uses ${banned} in ${hits.join(', ')}`).toEqual([])
    }
  })

  it('no text under 14px in any component or page', () => {
    const offenders: string[] = []
    for (const file of files()) {
      if (!/\.(tsx|mdx)$/.test(file)) continue
      const text = stripComments(readFileSync(file, 'utf-8'))
      const hits = text.match(/(?<![\w-])text-(?:xs|\[1[0-3](?:\.\d+)?px\])(?![\w-])/g)
      if (hits) offenders.push(`${file.slice(SRC.length)} → ${hits.join(' ')}`)
    }
    expect(offenders).toEqual([])
  })

  it('the only small font-size in a stylesheet is the 12px label', () => {
    // .label is the design's mono uppercase label at 0.75rem. Any other
    // rule that sets a size under 14px is an unmeasured decision.
    const offenders: string[] = []
    for (const r of globalRules) {
      for (const m of r.body.matchAll(/font-size:\s*([\d.]+)(rem|px)/g)) {
        const px = m[2] === 'rem' ? +m[1] * 16 : +m[1]
        if (px >= 14) continue
        if (r.selector.split(',').map((s) => s.trim()).includes('.label') && px === 12) continue
        offenders.push(`${r.selector} sets ${m[1]}${m[2]}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
