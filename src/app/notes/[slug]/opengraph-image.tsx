import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image'
import { getNote, publishedNotes } from '@/lib/notes'
import { longDate } from '@/lib/dates'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Note by Caleb Pham'

export function generateStaticParams() {
  return publishedNotes().map((n) => ({ slug: n.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const n = getNote(slug)
  if (!n) return ogImage({ eyebrow: 'Note', title: 'Caleb Pham' })
  return ogImage({ eyebrow: 'Note', title: n.title, subtitle: n.summary, tags: [longDate(n.date), `${n.readingMinutes} minute read`] })
}
