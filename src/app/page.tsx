import type { Metadata } from 'next'
import { Container } from '@/components/container'
import { SITE } from '@/lib/site'
import Smoke from '@/content/smoke.mdx'

export const metadata: Metadata = { alternates: { canonical: '/' } }

// Phase 0 placeholder. The real home page (hero, case-study teasers,
// also-built list, notes teasers, contact close) lands in Phase 1.
export default function HomePage() {
  return (
    <Container className="py-16 sm:py-24">
      <p className="eyebrow">{SITE.title}</p>
      <h1 className="mt-4 max-w-[18ch]">
        Operator turned <em>software engineer</em>.
      </h1>
      <p className="mt-6 max-w-[52ch] text-muted-strong">{SITE.description}</p>
      <p className="mt-8 flex flex-wrap gap-3">
        <a href={`mailto:${SITE.email}`} className="pill pill-primary">
          Email Caleb
        </a>
        <a href={SITE.linkedin} rel="noopener" className="pill pill-secondary">
          LinkedIn
        </a>
      </p>
      <div className="prose mt-16">
        <Smoke />
      </div>
    </Container>
  )
}
