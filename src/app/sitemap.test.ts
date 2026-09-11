// The sitemap and the routes on disk must agree, in both directions.
//
// A hand-kept list falls behind the moment someone adds a page without
// remembering it (LumaIQ's proxy allow-list did this three times). This walks
// the real src/app tree for page.tsx files, expands each dynamic segment from
// its index, and compares the set to what sitemap() returns.
//
// WHAT BREAKS IF THIS IS WRONG: a page exists that no crawler is told about,
// or the sitemap advertises a URL that 404s, and nothing on screen shows it.

import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import sitemap from './sitemap'
import { SITE_URL } from '@/lib/site'
import { publishedProjects } from '@/lib/projects'
import { publishedNotes } from '@/lib/notes'

const APP = fileURLToPath(new URL('.', import.meta.url))

function pageRoutes(dir = APP, prefix = ''): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      // Route groups `(name)` add no segment; private folders `_name` are not routes.
      if (entry.startsWith('_')) continue
      const segment = entry.startsWith('(') ? '' : `/${entry}`
      out.push(...pageRoutes(full, prefix + segment))
    } else if (entry === 'page.tsx' || entry === 'page.mdx') {
      out.push(prefix || '/')
    }
  }
  return out
}

/** `/work/[slug]` becomes one route per published item; unknown patterns throw. */
function expand(route: string): string[] {
  if (!route.includes('[')) return [route]
  if (route === '/work/[slug]') return publishedProjects().map((p) => `/work/${p.slug}`)
  if (route === '/notes/[slug]') return publishedNotes().map((n) => `/notes/${n.slug}`)
  throw new Error(`sitemap.test.ts does not know how to expand ${route}`)
}

describe('sitemap matches the routes on disk', () => {
  const onDisk = new Set(pageRoutes().flatMap(expand))
  const listed = new Set(sitemap().map((e) => e.url.replace(SITE_URL, '') || '/'))

  it('lists every page that exists', () => {
    expect([...onDisk].filter((r) => !listed.has(r))).toEqual([])
  })

  it('lists nothing that does not exist', () => {
    expect([...listed].filter((r) => !onDisk.has(r))).toEqual([])
  })

  it('uses absolute URLs on the canonical host', () => {
    for (const e of sitemap()) expect(e.url.startsWith(`${SITE_URL}/`)).toBe(true)
  })
})
