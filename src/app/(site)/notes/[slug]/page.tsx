import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/container'
import { getNote, publishedNotes } from '@/lib/notes'
import { longDate } from '@/lib/dates'

// Mirrors /work/[slug] without a swatch. The index decides which slugs
// exist; an unknown slug is a build-time 404.
export const dynamicParams = false

export function generateStaticParams() {
  return publishedNotes().map((n) => ({ slug: n.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const n = getNote(slug)
  if (!n) return { title: 'Not found' }
  return {
    title: n.title,
    description: n.summary,
    alternates: { canonical: `/notes/${n.slug}` },
    openGraph: { title: n.title, description: n.summary, url: `/notes/${n.slug}`, type: 'article', publishedTime: `${n.date}T12:00:00.000Z` },
  }
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const n = getNote(slug)
  if (!n) notFound()
  const { default: Body } = await import(`@/content/notes/${slug}.mdx`)

  return (
    <Container className="py-14 sm:py-20">
      <article className="mx-auto max-w-[720px]">
        <header>
          <p className="label">Note</p>
          <h1 className="mt-3">{n.title}</h1>
          <p className="mt-4 text-[1.125rem] text-muted-strong">{n.summary}</p>
          <p className="mt-3 text-sm text-muted tnum">
            {longDate(n.date)}. {n.readingMinutes} minute read.
          </p>
        </header>
        <div className="prose mt-12">
          <Body />
        </div>
        <p className="mt-16 border-t border-line pt-6">
          <Link href="/notes" className="label nav-link">
            All notes <span aria-hidden="true">→</span>
          </Link>
        </p>
      </article>
    </Container>
  )
}
