// Length is a rule here, not a taste.
//
// On 2026-09-12 Caleb read the site and called it fluff: too many sentences
// before the point, and the same claim on three pages. The one page keeps
// that rule: a heading stays under 15 words, the lede under 40, a milestone,
// a job line or a step under 30, an About paragraph under 60.
//
// WHAT BREAKS IF THIS IS WRONG: nothing on screen. A paragraph grows by a
// sentence in each edit until the page is an essay again, and nobody notices
// because every sentence was fine on its own.

import { describe, expect, it } from 'vitest'
import { ABOUT, DEMO, HERO, JOBS, MILESTONES } from '@/lib/page'

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length

const LIMITS = { heading: 15, lede: 40, line: 30, paragraph: 60 }

function over(limit: number, strings: readonly string[]): string[] {
  return strings.filter((s) => words(s) > limit).map((s) => `${words(s)} words: ${s.slice(0, 50)}`)
}

describe('the page', () => {
  it(`keeps every heading under ${LIMITS.heading} words`, () => {
    const headings = [
      HERO.title,
      JOBS.title,
      ABOUT.title,
      ABOUT.belief,
      DEMO.title,
      ...MILESTONES.items.map((m) => m.title),
      ...JOBS.items.map((j) => j.title),
    ]
    expect(over(LIMITS.heading, headings)).toEqual([])
  })

  it(`keeps the lede under ${LIMITS.lede} words`, () => {
    expect(over(LIMITS.lede, [HERO.lede])).toEqual([])
  })

  it(`keeps every milestone, job line and step under ${LIMITS.line} words`, () => {
    expect(over(LIMITS.line, [...MILESTONES.items.map((m) => m.text), ...JOBS.items.map((j) => j.text), ...DEMO.steps])).toEqual([])
  })

  it(`keeps every About paragraph under ${LIMITS.paragraph} words`, () => {
    expect(over(LIMITS.paragraph, ABOUT.paragraphs)).toEqual([])
  })

  it('shows three milestones and three jobs, no more', () => {
    // "Highlight our achievements briefly" (2026-10-21): a fourth milestone
    // turns a strip into a list. The jobs heading says three.
    expect(MILESTONES.items).toHaveLength(3)
    expect(JOBS.items).toHaveLength(3)
    expect(JOBS.title.startsWith('Three')).toBe(true)
  })
})
