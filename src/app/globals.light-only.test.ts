// The whole site is light-only, by construction.
//
// LumaIQ pins its public pages to the light palette inside a themed product,
// and the mechanism there failed once in a way nobody saw in light mode: a
// shared button carried a `dark:` utility that painted near-black on the
// accent fill for visitors whose OS was dark. Measured 2.3:1.
//
// This site has no dark theme at all, so the guard is simpler: there is no
// dark block to pin against, no dark variant to scope, and no `dark:` utility
// anywhere to fire. Each of the three is asserted, because any one of them
// returning would be the first step back to that bug.
//
// WHAT BREAKS IF THIS IS WRONG: nothing whoever writes the code will see,
// because it looks right in light mode. It goes wrong on someone else's
// machine.

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
    else if (/\.(tsx|mdx)$/.test(entry)) out.push(full)
  }
  return out
}

describe('globals.css', () => {
  it('declares color-scheme: light on :root', () => {
    expect(CSS).toMatch(/:root\s*\{[^}]*color-scheme:\s*light;/)
  })

  it('has no dark block, dark variant, or colour-scheme media query', () => {
    expect(CSS).not.toMatch(/\n\.dark\s*\{/)
    expect(CSS).not.toMatch(/@custom-variant dark/)
    expect(CSS).not.toMatch(/prefers-color-scheme/)
  })
})

describe('components and content', () => {
  it('use no dark: utilities anywhere', () => {
    const offenders: string[] = []
    for (const file of walk(SRC)) {
      const hits = [...readFileSync(file, 'utf-8').matchAll(/(?<![\w-])dark:[^\s'"`]+/g)]
      if (hits.length) offenders.push(`${file.slice(SRC.length)} → ${hits.map((m) => m[0]).join(' ')}`)
    }
    expect(offenders).toEqual([])
  })

  it('the root layout tells the browser the scheme is light', () => {
    const layout = readFileSync(join(SRC, 'app', 'layout.tsx'), 'utf-8')
    expect(layout).toMatch(/colorScheme:\s*'light'/)
  })
})
