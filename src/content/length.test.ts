// Length is a rule here, not a taste.
//
// On 2026-09-12 Caleb read the site and called it fluff: too many sentences
// before the point, and the same claim on three pages. The copy was cut to
// proof first, and this test keeps it there: no paragraph on the site over 60
// words, no case study over 400 words of prose outside the code, no home
// string over 40 words, the bio under 150, no caption over 30.
//
// WHAT BREAKS IF THIS IS WRONG: nothing on screen. A paragraph grows by a
// sentence in each edit until the page is an essay again, and nobody notices
// because every sentence was fine on its own.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { publishedProjects, PROJECTS } from '@/lib/projects'
import { HOME_COPY, DESK_ROWS } from '@/lib/home'
import { BIO, BELIEFS } from '@/lib/bio'
import { RESUME } from '@/lib/resume'

const CONTENT = fileURLToPath(new URL('.', import.meta.url))
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

const LIMITS = { paragraph: 60, caseStudy: 400, homeString: 40, bio: 280, caption: 30, bullet: 30 }   // bio raised on 2026-09-12: he asked for its weight back, one arc in five short paragraphs

/** Prose of an MDX file: fences, tags and headings removed, split on blank lines. */
function proseParagraphs(src: string): string[] {
  const stripped = src
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/^#+ .*$/gm, '')
  return stripped.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
}

describe.each(publishedProjects().map((p) => p.slug))('case study %s', (slug) => {
  const src = readFileSync(join(CONTENT, 'work', `${slug}.mdx`), 'utf-8')
  const paras = proseParagraphs(src)

  it(`keeps every paragraph under ${LIMITS.paragraph} words`, () => {
    const long = paras.filter((p) => words(p) > LIMITS.paragraph).map((p) => `${words(p)} words: ${p.slice(0, 60)}`)
    expect(long).toEqual([])
  })

  it(`keeps its prose under ${LIMITS.caseStudy} words in total`, () => {
    const total = paras.reduce((n, p) => n + words(p), 0)
    expect(total, `${slug} carries ${total} words of prose outside the code`).toBeLessThanOrEqual(LIMITS.caseStudy)
  })

  it('opens with one lead paragraph before the first section', () => {
    const before = src.split(/^## /m)[0]
    expect(proseParagraphs(before).length, 'one lead paragraph, then the sections').toBe(1)
  })

  it(`keeps every caption under ${LIMITS.caption} words`, () => {
    for (const m of src.matchAll(/caption="([^"]*)"/g)) {
      expect(words(m[1]), `caption: ${m[1].slice(0, 50)}`).toBeLessThanOrEqual(LIMITS.caption)
    }
  })
})

describe('the home page', () => {
  it(`keeps every string under ${LIMITS.homeString} words`, () => {
    const long: string[] = []
    for (const [key, value] of Object.entries(HOME_COPY)) if (words(value) > LIMITS.homeString) long.push(`${key}: ${words(value)}`)
    for (const row of DESK_ROWS) if (words(row.text) > LIMITS.homeString) long.push(`${row.label}: ${words(row.text)}`)
    for (const p of PROJECTS) if (p.blurb && words(p.blurb) > LIMITS.homeString) long.push(`${p.slug} blurb: ${words(p.blurb)}`)
    expect(long).toEqual([])
  })
})

describe('the bio', () => {
  it(`is under ${LIMITS.bio} words and no paragraph passes ${LIMITS.paragraph}`, () => {
    const total = BIO.reduce((n, p) => n + words(p), 0)
    expect(total, `the bio is ${total} words`).toBeLessThanOrEqual(LIMITS.bio)
    for (const p of BIO) expect(words(p), p.slice(0, 40)).toBeLessThanOrEqual(LIMITS.paragraph)
    for (const b of BELIEFS) expect(words(b)).toBeLessThanOrEqual(20)
  })
})

describe('the resume', () => {
  it(`keeps the summary under ${LIMITS.paragraph} words and every bullet under ${LIMITS.bullet}`, () => {
    expect(words(RESUME.summary)).toBeLessThanOrEqual(LIMITS.paragraph)
    const long: string[] = []
    for (const r of RESUME.roles) {
      for (const b of r.bullets) {
        const text = typeof b === 'string' ? b : b.text
        if (words(text) > LIMITS.bullet) long.push(`${r.title}: ${words(text)} words: ${text.slice(0, 40)}`)
      }
    }
    expect(long).toEqual([])
  })
})
