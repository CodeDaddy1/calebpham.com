// The whole site is light-only, by construction.
//
// LumaIQ pins its public pages to one palette inside a themed product, and
// the mechanism there failed once in a way nobody saw on the author's
// machine: a shared button carried a `dark:` utility that painted near-black
// on the accent fill for visitors whose OS was dark. Measured 2.3:1.
//
// This site has one theme (LumaIQ's light look, ruled 2026-10-19), so the
// guard is simple: there is no second block to pin against, no scheme
// variant to scope, and no `dark:` or `light:` utility anywhere to fire.
// Each is asserted, because any one of them returning would be the first
// step back to that bug.
//
// WHAT BREAKS IF THIS IS WRONG: a stray `dark:` rule or a
// prefers-color-scheme block paints a dark ground behind #1A2130 text on
// someone else's machine, and nothing here sees it.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const SRC = fileURLToPath(new URL('../', import.meta.url))
/** Comments explain the rules by naming them; strip before matching. */
const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '')
const CSS = stripComments(readFileSync(join(SRC, 'app', 'globals.css'), 'utf-8'))

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.tsx$/.test(entry)) out.push(full)
  }
  return out
}

describe('globals.css', () => {
  it('declares color-scheme: light on :root', () => {
    expect(CSS).toMatch(/:root\s*\{[^}]*color-scheme:\s*light;/)
  })

  it('has no second theme block, no scheme variant, and no colour-scheme media query', () => {
    expect(CSS).not.toMatch(/\n\.(dark|light)\s*\{/)
    expect(CSS).not.toMatch(/@custom-variant (dark|light)/)
    expect(CSS).not.toMatch(/prefers-color-scheme/)
    expect(CSS).not.toMatch(/color-scheme:\s*dark/)
  })
})

describe('components and pages', () => {
  it('use no dark: or light: utilities anywhere', () => {
    const offenders: string[] = []
    for (const file of walk(SRC)) {
      const hits = [...readFileSync(file, 'utf-8').matchAll(/(?<![\w-])(?:dark|light):[^\s'"`]+/g)]
      if (hits.length) offenders.push(`${file.slice(SRC.length)} → ${hits.map((m) => m[0]).join(' ')}`)
    }
    expect(offenders).toEqual([])
  })

  it('the root layout tells the browser the scheme is light and paints the chrome the header colour', () => {
    const layout = readFileSync(join(SRC, 'app', 'layout.tsx'), 'utf-8')
    expect(layout).toMatch(/colorScheme:\s*'light'/)
    const card = CSS.match(/--card:\s*(#[0-9A-Fa-f]{6})/)![1]
    expect(layout, `themeColor must be the --card token, ${card}`).toMatch(new RegExp(`themeColor:\\s*'${card}'`, 'i'))
  })
})
