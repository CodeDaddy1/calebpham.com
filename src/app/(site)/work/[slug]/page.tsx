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
      <article data-swatch={p.slug} className="mx-auto max-w-[720px]">
        <Reveal />
        <header className="swatch-rule pt-6">
          <p className="eyebrow text-swatch-ink">Case study</p>
          <h1 className="mt-3">{p.name}</h1>
          <p className="mt-4 text-[1.125rem] text-muted-strong">{p.tagline}</p>
          <dl className="mt-6 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="text-muted">Role</dt>
            <dd className="m-0">{p.role}</dd>
            <dt className="text-muted">Period</dt>
            <dd className="m-0 tnum">{period(p.period.start, p.period.end)}</dd>
            <dt className="text-muted">Stack</dt>
            <dd className="m-0">{p.stack.join(', ')}</dd>
            {(p.links.live || p.links.repo) && (
              <>
                <dt className="text-muted">Links</dt>
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
        <div className="prose mt-12">
          <Body />
        </div>
        <p className="mt-16 border-t border-line pt-6">
          <Link href="/work" className="text-accent underline underline-offset-4">
            All case studies
          </Link>
        </p>
      </article>
    </Container>
  )
}
