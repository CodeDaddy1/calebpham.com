import type { Metadata } from 'next'
import Image from 'next/image'
import { Container } from '@/components/container'
import { BIO } from '@/lib/bio'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: 'About',
  description: BIO[0],
  alternates: { canonical: '/about' },
}

// The bio is BIO, verbatim, in order, nothing added. The portrait is the only
// headshot on file (600 by 800); it renders at a fixed 280 CSS px so 2x is
// 560 and never asks for more than the source has.
export default function AboutPage() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="grid gap-10 md:grid-cols-[280px_1fr] md:gap-16">
        <Image
          src="/team/caleb-pham.jpg"
          alt="Caleb Pham"
          width={600}
          height={800}
          sizes="280px"
          preload
          className="h-auto w-[280px] max-w-full rounded-md border border-line"
        />
        <div>
          <p className="label">About</p>
          <h1 className="mt-3">{SITE.name}</h1>
          <p className="mt-2 text-muted-strong">
            {SITE.title}. {SITE.location}.
          </p>
          <div className="prose mt-8">
            {BIO.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-8 flex flex-wrap gap-3">
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
  )
}
