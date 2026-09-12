import type { Metadata } from 'next'
import Image from 'next/image'
import { Container } from '@/components/container'
import { PageBand } from '@/components/page-band'
import { BELIEFS, BIO } from '@/lib/bio'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Founder and Software Engineer, Proptech, in Houston. Self-taught since the pandemic; area manager for six storage properties before LumaIQ; golf and, once, the French horn.',
  alternates: { canonical: '/about' },
  openGraph: { url: '/about' },
}

// The bio is BIO, in Caleb's words, in order, nothing added; the two beliefs
// under it are BELIEFS, stated once, here. The portrait is the only headshot
// on file (600 by 800); it renders at a fixed 280 CSS px so 2x is 560 and
// never asks for more than the source has.
export default function AboutPage() {
  return (
    <>
      <PageBand label="About" title={SITE.name} lede={`${SITE.title}. ${SITE.location}.`} />
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[280px_1fr] md:gap-16">
          <Image
            src="/team/caleb-pham.jpg"
            alt="Caleb Pham"
            width={600}
            height={800}
            sizes="280px"
            preload
            className="portrait h-auto w-[280px] max-w-full rounded-md border border-line"
            data-reveal
            data-reveal-scale
          />
          <div>
            <div className="prose" data-reveal style={{ '--i': 1 } as React.CSSProperties}>
              {BIO.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <section aria-labelledby="beliefs" className="mt-10">
              <h2 id="beliefs" className="label" data-reveal>
                What I hold
              </h2>
              <ul className="rows mt-2 list-none p-0" style={{ marginTop: 0 }}>
                {BELIEFS.map((line, i) => (
                  <li key={line} className="row m-0" data-reveal style={{ '--i': i } as React.CSSProperties}>
                    <p className="label m-0">{String(i + 1).padStart(2, '0')}</p>
                    <p className="text-foreground">{line}</p>
                  </li>
                ))}
              </ul>
            </section>
            <p className="mt-8 flex flex-wrap gap-3" data-reveal>
              <a href={`mailto:${SITE.email}`} className="pill pill-primary">
                Email Caleb
              </a>
              <a href={SITE.linkedin} rel="noopener" className="pill pill-secondary">
                LinkedIn
              </a>
            </p>
          </div>
        </div>
      </Container>
    </>
  )
}
