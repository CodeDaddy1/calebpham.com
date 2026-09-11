// The house diction, enforced on every prose surface.
//
// No em or en dashes. No exclamation marks. "and", never "&". Prose numbers
// written in full: never $400K, never 87–92%. Ranges use "to". The rules are
// Caleb's, and they hold on the site the same way they hold in LumaIQ's
// public copy.
//
// What is scanned: MDX prose with fenced and inline code removed (a quoted
// line of someone's code keeps its punctuation), JSX text in components and
// pages, and string literals in src/lib (the resume, the index taglines, the
// site description). Comments are not scanned; they are not on the page.
//
// WHAT BREAKS IF THIS IS WRONG: a page that reads as sloppy to the one
// reader it is written for.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const SRC = fileURLToPath(new URL('../', import.meta.url))

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(tsx|ts|mdx)$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(full)
  }
  return out
}

/** Prose only: fenced blocks, inline code, import/export lines, and JSX tags removed. */
function mdxProse(src: string): string {
  return src
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/^(import|export)\b.*$/gm, '')
    .replace(/<[^>]+>/g, ' ')
}

/** The visible text between JSX tags, plus string literals. */
function tsxText(src: string): { jsx: string; literals: string } {
  const noComments = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  const jsx = [...noComments.matchAll(/>([^<>{}]+)</g)].map((m) => m[1]).join('\n')
  const literals = [...noComments.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1] ?? m[2]).join('\n')
  return { jsx, literals }
}

const RULES: [name: string, pattern: RegExp, scope: 'all' | 'prose'][] = [
  ['em dash', /—/, 'all'],
  ['en dash', /–/, 'all'],
  ['abbreviated figure like $400K', /\$\d[\d,]*(?:\.\d+)?[KMB]\b/, 'all'],
  ['dashed percentage range', /\d+\s*[-–]\s*\d+\s*%/, 'all'],
  ['exclamation mark', /!/, 'prose'],
  ['ampersand for and', / & /, 'prose'],
]

describe('house diction', () => {
  const offenders: string[] = []

  for (const file of walk(SRC)) {
    const rel = file.slice(SRC.length)
    const src = readFileSync(file, 'utf-8')
    const surfaces: [label: string, text: string, kind: 'prose' | 'literal'][] = file.endsWith('.mdx')
      ? [['prose', mdxProse(src), 'prose']]
      : (() => {
          const t = tsxText(src)
          return [
            ['jsx text', t.jsx, 'prose'],
            ['string literal', t.literals, 'literal'],
          ]
        })()

    for (const [label, text, kind] of surfaces) {
      for (const [name, pattern, scope] of RULES) {
        if (scope === 'prose' && kind !== 'prose') continue
        const m = text.match(pattern)
        if (m) offenders.push(`${rel} (${label}): ${name} near "${text.slice(Math.max(0, (m.index ?? 0) - 30), (m.index ?? 0) + 30).replace(/\s+/g, ' ')}"`)
      }
    }
  }

  it('holds on every prose surface', () => {
    expect(offenders).toEqual([])
  })
})
