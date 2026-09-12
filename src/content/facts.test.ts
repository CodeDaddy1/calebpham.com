// Facts Caleb retired on 2026-09-12 never come back, and the word he refused
// never describes him.
//
// The site once said seven properties, 4,000 units, roughly $400,000 a month,
// occupancy at 87 to 92 percent and a team of 14. He corrected the record:
// six properties in two Texas markets, roughly 3,000 units and 350,000
// square feet, and no other management figure anywhere. He was an area
// manager, the bridge between the store teams and the head of operations,
// never "an operator"; the word survives only as the industry noun for the
// companies ("self-storage operators").
//
// WHAT BREAKS IF THIS IS WRONG: a hiring manager reads a number Caleb did not
// give, or a label he refused, on a page in his name. Nothing on screen
// shows the difference between a fact and a leftover.

import { readFileSync, readdirSync, statSync } from 'node:fs'
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

/** Retired figures, in every spelling the site ever used. */
const RETIRED: [string, RegExp][] = [
  ['seven properties or stores', /\bseven (?:self-storage |storage )?(?:properties|stores)\b/i],
  ['4,000 units', /\b4,000\b/],
  ['$400,000 monthly revenue', /\b400,000\b|\$400K/i],
  ['occupancy range', /\b87 to 92\b|\b87\s*[-–]\s*92\b/],
  ['team size', /\bteam of 14\b/i],
  ['Houston Area Manager as a title', /Houston Area Manager/],
]

/** "Operator" said of Caleb. The plural noun for the companies is allowed. */
const OPERATOR_OF_CALEB = /\boperator turned\b|\ban operator\b|\bas an operator\b|\bformer operator\b|\bthe operator I was\b/i

describe('the record Caleb corrected on 2026-09-12 stays corrected', () => {
  const files = walk(SRC)

  for (const [name, pattern] of RETIRED) {
    it(`never states ${name}`, () => {
      const hits: string[] = []
      for (const file of files) {
        readFileSync(file, 'utf-8').split('\n').forEach((line, i) => {
          if (pattern.test(line)) hits.push(`${file.slice(SRC.length)}:${i + 1}`)
        })
      }
      expect(hits).toEqual([])
    })
  }

  it('never links to GitHub or names the CodeDaddy1 handle', () => {
    // His call on 2026-09-12: the handle reads as unprofessional, so the site
    // links to no code host and the excerpts are the proof on their own.
    const hits: string[] = []
    for (const file of files) {
      readFileSync(file, 'utf-8').split('\n').forEach((line, i) => {
        if (/github\.com|CodeDaddy1/i.test(line)) hits.push(`${file.slice(SRC.length)}:${i + 1}`)
      })
    }
    expect(hits).toEqual([])
  })

  it('never calls him an operator', () => {
    const hits: string[] = []
    for (const file of files) {
      readFileSync(file, 'utf-8').split('\n').forEach((line, i) => {
        if (OPERATOR_OF_CALEB.test(line)) hits.push(`${file.slice(SRC.length)}:${i + 1} → ${line.trim().slice(0, 80)}`)
      })
    }
    expect(hits).toEqual([])
  })
})
