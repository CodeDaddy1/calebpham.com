// Every CSS variable a className or stylesheet names must actually exist.
//
// `var(--nope)` is valid CSS, Tailwind passes arbitrary values through
// untouched, and an undefined variable resolves to nothing rather than
// erroring. LumaIQ shipped a selected tab that was invisible on the page
// because `var(--fg)` was defined nowhere (the token was `--foreground`), and
// types, lint, the build, and the contrast test were all green.
//
// WHAT BREAKS IF THIS IS WRONG: a control that shows no state. The failure is
// invisible text or a missing fill, on whichever surface happens to use it.
//
// A new token belongs in globals.css. If this test fails, define it there
// rather than deleting the assertion.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = fileURLToPath(new URL('../', import.meta.url))
const CSS = readFileSync(fileURLToPath(new URL('./globals.css', import.meta.url)), 'utf-8')

/** Every `--name:` the stylesheet declares, in any block. */
function declaredTokens(css: string): Set<string> {
  return new Set(Array.from(css.matchAll(/(--[a-z0-9-]+)\s*:/gi), (m) => m[1]))
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(tsx|ts|css|mdx)$/.test(entry)) out.push(full)
  }
  return out
}

/** Comments discuss tokens without using them. */
const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

describe('CSS variables named in source are defined', () => {
  const files = walk(SRC)

  // `next/font` mints its own custom properties and puts them on <html> via a
  // className, so they are declared in TypeScript (src/app/fonts.ts) rather
  // than in the stylesheet.
  const fontTokens = new Set<string>()
  for (const file of files) {
    for (const m of readFileSync(file, 'utf-8').matchAll(/variable:\s*["'](--[a-z0-9-]+)["']/gi)) {
      fontTokens.add(m[1])
    }
  }

  it('globals.css declares the tokens the site reads', () => {
    const declared = new Set([...declaredTokens(CSS), ...fontTokens])
    const missing: string[] = []
    for (const file of files) {
      if (file.endsWith('globals.tokens.test.ts')) continue
      const scanned = stripComments(readFileSync(file, 'utf-8'))
      for (const m of scanned.matchAll(/var\((--[a-z0-9-]+)/gi)) {
        const name = m[1]
        // Tailwind's own generated namespace, and anything the file declares
        // for itself as a local custom property.
        if (name.startsWith('--tw-')) continue
        if (declared.has(name)) continue
        if (new RegExp(`${name}\\s*:`).test(scanned)) continue
        missing.push(`${file.slice(SRC.length)} → var(${name})`)
      }
    }
    expect(missing).toEqual([])
  })

  it('never redefines the easing names Tailwind owns', () => {
    // Tailwind v4 defines --ease-in, --ease-out and --ease-in-out on :root.
    // Redefining them here would rewrite every ease-in and ease-out utility.
    const declarations = stripComments(CSS)
    expect(declarations).not.toMatch(/--ease-in\s*:/)
    expect(declarations).not.toMatch(/--ease-out\s*:/)
    expect(declarations).not.toMatch(/--ease-in-out\s*:/)
  })
})
