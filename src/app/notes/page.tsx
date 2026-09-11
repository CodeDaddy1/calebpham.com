import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'
import { publishedNotes } from '@/lib/notes'
import { longDate } from '@/lib/dates'

export const metadata: Metadata = {
  title: 'Notes',
  description: 'Short engineering notes: a decision, the measurement behind it, and what breaks if it is wrong.',
  alternates: { canonical: '/notes' },
}

export default function NotesPage() {
  return (
    <Container className="py-16 sm:py-24">
      <p className="eyebrow">Notes</p>
      <h1 className="mt-3">Decision, measurement, what breaks</h1>
      <p className="mt-4 max-w-[54ch] text-muted-strong">
        Short notes on rules I keep because a measurement made me. Each one says what was decided, what was
        measured, and what breaks if it is wrong.
      </p>
      <ul className="mt-12 list-none space-y-8 p-0">
        {publishedNotes().map((n) => (
          <li key={n.slug} className="m-0 max-w-[62ch]">
            <p className="m-0 text-sm text-muted tnum">
              {longDate(n.date)}. {n.readingMinutes} minute read.
            </p>
            <h2 className="mt-1 font-serif text-[1.5rem] font-medium leading-tight">
              <Link href={`/notes/${n.slug}`} className="text-foreground no-underline hover:text-accent">
                {n.title}
              </Link>
            </h2>
            <p className="m-0 mt-2 text-muted-strong">{n.summary}</p>
          </li>
        ))}
      </ul>
    </Container>
  )
}
