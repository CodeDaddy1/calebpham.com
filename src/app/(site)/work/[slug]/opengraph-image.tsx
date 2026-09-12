import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image'
import { getProject, publishedProjects } from '@/lib/projects'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Case study by Caleb Pham'

// Without this the image route renders on demand for every request; with it
// the card is written at build time like the page it belongs to.
export function generateStaticParams() {
  return publishedProjects().map((p) => ({ slug: p.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getProject(slug)
  // The page itself 404s for an unknown slug; the card must still render
  // something rather than throw inside the image runtime.
  if (!p) return ogImage({ eyebrow: 'Case study', title: 'Caleb Pham' })
  return ogImage({ eyebrow: 'Case study', title: p.name, subtitle: p.tagline, tags: p.stack.slice(0, 3) })
}
