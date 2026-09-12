import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'
import { publishedNotes } from '@/lib/notes'
import { longDate } from '@/lib/dates'

export const metadata: Metadata = {
  title: 'Notes',
  description: 'Short engineering notes: a decision, the measurement behind it, and what breaks if it is wrong.',
  alternates: { canonical: '/notes' },
  openGraph: { url: '/notes' },
}

export default function NotesPage() {
  return (
    <Container className="py-16 sm:py-24">
      <p className="label">Notes</p>
      <h1 className="mt-3">Decision, measurement, what breaks</h1>
      <p className="mt-4 max-w-[54ch] text-muted-strong">
        Short notes on rules I keep because a measurement made me. Each one says what was decided, what was
        measured, and what breaks if it is wrong.
      </p>
      <ul className="rows mt-12 list-none p-0">
        {publishedNotes().map((n) => (
          <li key={n.slug} className="row m-0">
            <p className="label m-0 tnum">
              {longDate(n.date)}
              <br />
              {n.readingMinutes} minute read
            </p>
            <div>
              <h2 className="m-0 text-[1.5rem] font-medium leading-tight">
                <Link href={`/notes/${n.slug}`} className="text-foreground no-underline hover:text-accent-hover">
                  {n.title}
                </Link>
              </h2>
              <p className="m-0 mt-2 max-w-[62ch] text-muted-strong">{n.summary}</p>
            </div>
          </li>
        ))}
      </ul>
    </Container>
  )
}
