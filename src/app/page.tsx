import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'
import { ProjectTeaser } from '@/components/project-teaser'
import { SITE } from '@/lib/site'
import { publishedProjects } from '@/lib/projects'
import { ALSO_BUILT } from '@/lib/also-built'

export const metadata: Metadata = { alternates: { canonical: '/' } }

// The home page is written to one reader, a proptech hiring manager. Every
// section reads from a typed index; a new case study or note appears here
// with no edit to this file. Sections with nothing to show render nothing.
export default function HomePage() {
  const projects = publishedProjects()

  return (
    <>
      <section aria-labelledby="hero">
        <Container className="py-16 sm:py-24">
          <p className="eyebrow">{SITE.title}</p>
          <h1 id="hero" className="mt-4 max-w-[18ch]">
            Operator turned <em>software engineer</em>.
          </h1>
          <p className="mt-6 max-w-[54ch] text-[1.125rem] text-muted-strong">
            I ran seven self-storage properties and 4,000 units, then built LumaIQ, the asset management
            software the job needed. Sole engineer, concept through production.
          </p>
          <p className="mt-8 flex flex-wrap gap-3">
            {projects[0] && (
              <Link href={`/work/${projects[0].slug}`} className="pill pill-primary">
                Read the {projects[0].name} case study
              </Link>
            )}
            <a href="/Caleb-Pham-Resume.pdf" download className="pill pill-secondary">
              Resume (PDF)
            </a>
          </p>
        </Container>
      </section>

      {projects.length > 0 && (
        <section aria-labelledby="work" className="border-t border-line">
          <Container className="py-16 sm:py-20">
            <h2 id="work">Work</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {projects.map((p) => (
                <ProjectTeaser key={p.slug} project={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {ALSO_BUILT.length > 0 && (
        <section aria-labelledby="also-built" className="border-t border-line">
          <Container className="py-12 sm:py-16">
            <h2 id="also-built" className="text-[1.375rem]">
              Also built
            </h2>
            <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2">
              {ALSO_BUILT.map((item) => (
                <li key={item.name} className="m-0">
                  <p className="m-0 font-medium">
                    {item.href ? (
                      <a href={item.href} rel="noopener" className="text-foreground underline underline-offset-4 decoration-accent">
                        {item.name}
                      </a>
                    ) : (
                      item.name
                    )}
                    <span className="ml-2 text-sm text-muted">{item.year}</span>
                  </p>
                  <p className="m-0 mt-1 text-muted-strong">{item.oneLiner}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Notes teasers land here in Phase 5, when /notes/[slug] exists; typed routes refuse the href before then. */}

      <section aria-labelledby="contact" className="border-t border-line">
        <Container className="py-16 sm:py-20">
          <h2 id="contact">Get in touch</h2>
          <p className="mt-4 max-w-[54ch] text-muted-strong">
            I am always glad to hear from operators who build, software people curious about overlooked
            industries, and anyone working in real estate technology or applied AI. I also take on a small
            number of advisory and build engagements for self-storage operators.
          </p>
          <p className="mt-8 flex flex-wrap gap-3">
            <a href={`mailto:${SITE.email}`} className="pill pill-primary">
              Email Caleb
            </a>
            <a href={SITE.linkedin} rel="noopener" className="pill pill-secondary">
              LinkedIn
            </a>
          </p>
        </Container>
      </section>
    </>
  )
}
