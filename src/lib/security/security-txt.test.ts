// public/.well-known/security.txt is the address a researcher reads before
// emailing; RFC 9116 gives it four rules this test holds it to.
//
// Contact must be the site's own address, so a change to SITE.email cannot
// leave the file pointing at an old mailbox. Expires is required, must be in
// the future, and should be under a year out; a lapsed file is treated as
// stale by the tooling that reads it. Canonical is the literal apex URL,
// not SITE_URL, which can resolve to a preview host inside a Vercel build.
// The suite runs in prebuild, so a lapsed date turns the next deploy red
// with the fix in the message. That is the point.
//
// WHAT BREAKS IF THIS IS WRONG: a researcher finds a stale contact or an
// expired file and reports nothing, or reports it somewhere public first.

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { SITE } from '@/lib/site'

const PATH = fileURLToPath(new URL('../../../public/.well-known/security.txt', import.meta.url))
const DAY = 24 * 60 * 60 * 1000

describe('public/.well-known/security.txt', () => {
  it('exists, in Field: value lines', () => {
    expect(existsSync(PATH), 'public/.well-known/security.txt is missing').toBe(true)
    const lines = readFileSync(PATH, 'utf-8').split('\n')
    expect(lines.at(-1), 'the file ends with a newline').toBe('')
    for (const line of lines.slice(0, -1)) expect(line, line).toMatch(/^[A-Z][A-Za-z-]+: \S/)
  })

  const fields = Object.fromEntries(
    readFileSync(PATH, 'utf-8')
      .split('\n')
      .filter(Boolean)
      .map((line) => line.split(/: (.*)/).slice(0, 2) as [string, string]),
  )

  it('points at the site email, once', () => {
    const contacts = readFileSync(PATH, 'utf-8').split('\n').filter((l) => l.startsWith('Contact:'))
    expect(contacts).toEqual([`Contact: mailto:${SITE.email}`])
  })

  it('has an Expires date in the future and under a year out', () => {
    const expires = new Date(fields.Expires ?? '')
    expect(Number.isNaN(expires.getTime()), `Expires "${fields.Expires}" is not an ISO date`).toBe(false)
    const days = (expires.getTime() - Date.now()) / DAY
    expect(days, 'renew: set Expires in public/.well-known/security.txt one year out').toBeGreaterThan(0)
    expect(days, 'RFC 9116 wants Expires under a year out; set it one year from today').toBeLessThanOrEqual(366)
  })

  it('names its own canonical URL on the apex and the language', () => {
    expect(fields.Canonical).toBe('https://calebpham.com/.well-known/security.txt')
    expect(fields['Preferred-Languages']).toBe('en')
  })
})
