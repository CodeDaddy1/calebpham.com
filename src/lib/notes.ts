// The notes index. Same contract as projects.ts: prose in
// src/content/notes/<slug>.mdx, everything else here.

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

export const NOTES: readonly Note[] = []

export const publishedNotes = (): Note[] =>
  NOTES.filter((n) => n.status === 'published').sort((a, b) => b.date.localeCompare(a.date))

export const getNote = (slug: string): Note | undefined =>
  NOTES.find((n) => n.slug === slug && n.status === 'published')
