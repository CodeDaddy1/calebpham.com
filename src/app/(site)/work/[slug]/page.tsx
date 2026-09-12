import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/container'
import { PageBand } from '@/components/page-band'
import { Reveal } from '@/components/reveal'
import { getProject, publishedProjects } from '@/lib/projects'
import { period } from '@/lib/dates'

// One route for every case study. The index in src/lib/projects.ts decides
// which slugs exist; the prose is src/content/work/<slug>.mdx; the swatch is
// the [data-swatch='<slug>'] block in globals.css. An unknown slug is a 404 at
// build time, never a render at request time.
export const dynamicParams = false

export function generateStaticParams() {
  return publishedProjects().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = getProject(slug)
  if (!p) return { title: 'Not found' }
  return {
    title: p.name,
    description: p.tagline,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: p.name, description: p.tagline, url: `/work/${p.slug}`, type: 'article' },
  }
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getProject(slug)
  if (!p) notFound()
  const { default: Body } = await import(`@/content/work/${slug}.mdx`)

  const facts: [string, string][] = [
    ['Role', p.role],
    ['Period', period(p.period.start, p.period.end)],
    ['Stack', p.stack.join(', ')],
    ...(p.facts ?? []),
  ]

  return (
    <article data-swatch={p.slug}>
      <Reveal />
      <PageBand label="Case study" title={p.name} lede={p.tagline} banner={p.slug} className="band-swatch">
        {p.links.live && (
          <a href={p.links.live} rel="noopener" className="label nav-link band-link">
            Live site <span aria-hidden="true">→</span>
          </a>
        )}
      </PageBand>
      <Container className="py-12 sm:py-16">
        <dl className="facts-strip" data-reveal>
          {facts.map(([label, value], i) => (
            <div key={label} className="facts-cell" style={{ '--i': i } as React.CSSProperties}>
              <dt className="label">{label}</dt>
              <dd className="m-0">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="prose article-body mt-12 max-w-none">
          <Body />
        </div>
        <p className="mt-16 border-t border-line pt-6">
          <Link href="/work" className="label nav-link">
            All case studies <span aria-hidden="true">→</span>
          </Link>
        </p>
      </Container>
    </article>
  )
}
