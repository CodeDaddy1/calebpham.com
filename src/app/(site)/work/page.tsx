import type { Metadata } from 'next'
import { Container } from '@/components/container'
import { PageBand } from '@/components/page-band'
import { ProjectRow } from '@/components/project-row'
import { publishedProjects } from '@/lib/projects'
import { ALSO_BUILT } from '@/lib/also-built'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Case studies: what was built, the decisions behind it, and what breaks if they are wrong.',
  alternates: { canonical: '/work' },
  openGraph: { url: '/work' },
}

// Exists so a reader who trims /work/lumaiq to /work does not land on a 404.
// The rows are the same component the home page's Code chapter uses, so the
// two cannot describe a project differently. The also-built list lives here
// now that the home page is the cinema.
export default function WorkPage() {
  return (
    <>
      <PageBand label="Work" title="Case studies" lede="What was built, the decisions behind it, and what breaks if they are wrong." />
      <Container className="py-12 sm:py-16">
        <ol className="projects list-none p-0" style={{ marginTop: 0 }}>
          {publishedProjects().map((p, i) => (
            <li key={p.slug} className="m-0" data-reveal style={{ '--i': i } as React.CSSProperties}>
              <ProjectRow project={p} index={i} />
            </li>
          ))}
        </ol>
        {ALSO_BUILT.length > 0 && (
          <section aria-labelledby="also-built" className="mt-16">
            <h2 id="also-built" className="label" data-reveal>
              Also built
            </h2>
            <ul className="rows mt-2 list-none p-0" style={{ marginTop: 0 }}>
              {ALSO_BUILT.map((item, i) => (
                <li key={item.name} className="row m-0" data-reveal style={{ '--i': i } as React.CSSProperties}>
                  <p className="label m-0">{item.year}</p>
                  <p>
                    {item.href ? (
                      <a href={item.href} rel="noopener" className="text-foreground underline underline-offset-4">
                        {item.name}
                      </a>
                    ) : (
                      <span className="text-foreground">{item.name}</span>
                    )}
                    . {item.oneLiner}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </>
  )
}
