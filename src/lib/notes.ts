// The notes index. Same contract as projects.ts: prose in
// src/content/notes/<slug>.mdx, everything else here. Each note is a claim in
// Caleb's name, signed off in the pull request that adds it. A note he has
// not signed stays `draft`: it has a file and an index entry, and no page.

import type { Status } from './projects'

export interface Note {
  slug: string
  title: string
  /** One sentence: the claim the note defends. */
  summary: string
  /** ISO date 'YYYY-MM-DD'. */
  date: string
  readingMinutes: number
  status: Status
}

export const NOTES: readonly Note[] = [
  {
    slug: 'contrast-on-both-surfaces',
    title: 'Measure a text colour on every surface it can land on',
    summary: 'A token that clears the accessibility floor on the page and fails on its own tint fails silently, so the test composites the tint over both surfaces before it measures.',
    date: '2026-09-11',
    readingMinutes: 4,
    status: 'draft',
  },
  {
    slug: 'insert-returning-under-restrictive-rls',
    title: 'INSERT RETURNING under a restrictive row-level security policy',
    summary: 'A policy whose check reads the table cannot see the row the same command inserted, so insert with a client-minted id and read it back in a second command.',
    date: '2026-09-11',
    readingMinutes: 4,
    status: 'published',
  },
  {
    slug: 'frozen-palette-for-film-scenes',
    title: 'A frozen palette needs a test that pins it to the tokens',
    summary: 'A composition that cannot read CSS variables carries a copy of the palette, and the copy drifts unless a test compares it to the live tokens.',
    date: '2026-09-11',
    readingMinutes: 3,
    status: 'draft',
  },
]

export const publishedNotes = (): Note[] =>
  NOTES.filter((n) => n.status === 'published').sort((a, b) => b.date.localeCompare(a.date))

export const getNote = (slug: string): Note | undefined =>
  NOTES.find((n) => n.slug === slug && n.status === 'published')
