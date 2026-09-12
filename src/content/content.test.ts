// The proof shape every case study must follow, enforced rather than described.
//
// A case study earns its place by quoting real code and then saying three
// things about it: the decision, the measurement behind it, and what breaks if
// it is wrong. This test refuses a case study that skips any of them, quotes
// too little to judge or too much to read, links to a moving branch instead
// of a fixed commit, or ships a figure without a description.
//
// It also keeps the typed index and the MDX files in step: every published
// slug has a file, and every file has an index entry.
//
// WHAT BREAKS IF THIS IS WRONG: a case study that reads as marketing instead
// of evidence, which is the one thing this site must never do.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PROJECTS, publishedProjects } from '@/lib/projects'
import { NOTES, publishedNotes } from '@/lib/notes'

const CONTENT = fileURLToPath(new URL('.', import.meta.url))
const WORK = join(CONTENT, 'work')
const NOTES_DIR = join(CONTENT, 'notes')

const mdxFiles = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.mdx')) : [])

describe('index and files agree', () => {
  it('every published project has an MDX file', () => {
    for (const p of publishedProjects()) expect(existsSync(join(WORK, `${p.slug}.mdx`)), `${p.slug}.mdx`).toBe(true)
  })

  it('every work MDX file has an index entry', () => {
    const slugs = new Set(PROJECTS.map((p) => p.slug as string))
    for (const f of mdxFiles(WORK)) expect(slugs.has(f.replace(/\.mdx$/, '')), f).toBe(true)
  })

  it('every published note has an MDX file', () => {
    for (const n of publishedNotes()) expect(existsSync(join(NOTES_DIR, `${n.slug}.mdx`)), `${n.slug}.mdx`).toBe(true)
  })

  it('every note MDX file has an index entry', () => {
    const slugs = new Set(NOTES.map((n) => n.slug))
    for (const f of mdxFiles(NOTES_DIR)) expect(slugs.has(f.replace(/\.mdx$/, '')), f).toBe(true)
  })
})

/** Each <CodeQuote …>…</CodeQuote> block with its attributes and fence. */
function codeQuotes(src: string) {
  return [...src.matchAll(/<CodeQuote\b([^>]*)>([\s\S]*?)<\/CodeQuote>/g)].map((m) => {
    const attrs = m[1]
    const inner = m[2]
    const fence = inner.match(/```[a-z]*\n([\s\S]*?)```/)
    const href = attrs.match(/href="([^"]+)"/)?.[1]
    const after = src.slice((m.index ?? 0) + m[0].length)
    return { attrs, href, fenceLines: fence ? fence[1].replace(/\n$/, '').split('\n').length : 0, after }
  })
}

describe.each(publishedProjects().map((p) => p.slug))('case study %s', (slug) => {
  const src = readFileSync(join(WORK, `${slug}.mdx`), 'utf-8')
  const quotes = codeQuotes(src)

  it('quotes at least one excerpt', () => {
    expect(quotes.length).toBeGreaterThanOrEqual(1)
  })

  it.each(quotes.map((q, i) => [i + 1, q] as const))('excerpt %i has 20 to 40 lines and the three labels', (_i, q) => {
    expect(q.fenceLines, 'fence line count').toBeGreaterThanOrEqual(20)
    expect(q.fenceLines, 'fence line count').toBeLessThanOrEqual(40)
    const decision = q.after.indexOf('**Decision.**')
    const measurement = q.after.indexOf('**Measurement.**')
    const breaks = q.after.indexOf('**What breaks if wrong.**')
    expect(decision, 'Decision paragraph').toBeGreaterThanOrEqual(0)
    expect(measurement, 'Measurement paragraph').toBeGreaterThan(decision)
    expect(breaks, 'What breaks if wrong paragraph').toBeGreaterThan(measurement)
    expect(q.attrs).toMatch(/file="[^"]+"/)
    expect(q.attrs).toMatch(/lines="\d+ to \d+"/)
  })

  it('links only to a fixed commit, never a branch', () => {
    for (const q of quotes) {
      if (q.href) expect(q.href, q.href).toMatch(/\/blob\/[0-9a-f]{7,40}\//)
    }
  })

  it('describes every figure', () => {
    for (const m of src.matchAll(/<Figure\b([^>]*)>/g)) {
      const alt = m[1].match(/alt="([^"]*)"/)?.[1] ?? ''
      expect(alt.trim().length, `Figure alt in ${slug}`).toBeGreaterThan(10)
      expect(alt.toLowerCase(), 'alt must say what the screen shows').not.toMatch(/^screenshot$/)
    }
  })

  // A <Paired> block puts one excerpt beside the demo screen it drives. The
  // three labels stay outside it, after the block, where the reader reads
  // them under both columns.
  it('pairs one excerpt with one captioned figure, labels after the pair', () => {
    for (const m of src.matchAll(/<Paired\b[^>]*>([\s\S]*?)<\/Paired>/g)) {
      const inner = m[1]
      expect((inner.match(/<CodeQuote\b/g) ?? []).length, 'one excerpt per Paired').toBe(1)
      expect((inner.match(/<Figure\b/g) ?? []).length, 'one figure per Paired').toBe(1)
      expect(inner.indexOf('<CodeQuote'), 'excerpt before figure').toBeLessThan(inner.indexOf('<Figure'))
      expect(inner).not.toMatch(/\*\*(Decision|Measurement|What breaks if wrong)\.\*\*/)
      const caption = inner.match(/<Figure\b[^>]*caption="([^"]*)"/)?.[1] ?? ''
      expect(caption.trim().length, 'a paired figure names the surface it shows').toBeGreaterThanOrEqual(20)
    }
    expect((src.match(/<Paired\b/g) ?? []).length, 'every Paired is closed').toBe((src.match(/<\/Paired>/g) ?? []).length)
  })
})
