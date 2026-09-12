import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/container'
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

  return (
    <Container className="py-14 sm:py-20">
      <article data-swatch={p.slug}>
        <Reveal />
        <header className="swatch-rule max-w-[45rem] pt-6">
          <p className="label text-swatch-ink">Case study</p>
          <h1 className="mt-3">{p.name}</h1>
          <p className="mt-4 text-[1.125rem] text-muted-strong">{p.tagline}</p>
          <dl className="mt-8 grid gap-x-8 gap-y-3 border-t border-line pt-4 text-sm sm:grid-cols-[8rem_1fr]">
            <dt className="label">Role</dt>
            <dd className="m-0">{p.role}</dd>
            <dt className="label">Period</dt>
            <dd className="m-0 tnum">{period(p.period.start, p.period.end)}</dd>
            <dt className="label">Stack</dt>
            <dd className="m-0">{p.stack.join(', ')}</dd>
            {(p.links.live || p.links.repo) && (
              <>
                <dt className="label">Links</dt>
                <dd className="m-0 flex flex-wrap gap-4">
                  {p.links.live && (
                    <a href={p.links.live} rel="noopener" className="inline-flex min-h-11 items-center text-accent underline underline-offset-4">
                      Live site
                    </a>
                  )}
                  {p.links.repo && (
                    <a href={p.links.repo} rel="noopener" className="inline-flex min-h-11 items-center text-accent underline underline-offset-4">
                      Repository
                    </a>
                  )}
                </dd>
              </>
            )}
          </dl>
        </header>
        <div className="prose article-body mt-12 max-w-none">
          <Body />
        </div>
        <p className="mt-16 border-t border-line pt-6">
          <Link href="/work" className="label nav-link">
            All case studies <span aria-hidden="true">→</span>
          </Link>
        </p>
      </article>
    </Container>
  )
}
