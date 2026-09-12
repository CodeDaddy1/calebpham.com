import type { Metadata } from 'next'
import { Container } from '@/components/container'
import { PageBand } from '@/components/page-band'
import { ResumeDocument } from '@/components/resume/resume-document'
import { Reveal } from '@/components/reveal'
import { RESUME } from '@/lib/resume'

export const metadata: Metadata = {
  title: 'Resume',
  description:
    'The resume of Caleb Pham: Founding Software Engineer at LumaIQ after managing six self-storage properties in two Texas markets. One Letter page, real text, as a PDF.',
  alternates: { canonical: '/resume' },
  openGraph: { url: '/resume' },
}

// On screen the band carries the name, headline and contact line, and the
// document's own header is hidden; in print the band is hidden and the
// document's header shows, so the PDF stands alone. The download is an
// anchor, never a button: a download is a navigation. The file is generated
// from this very page by scripts/build-resume-pdf.mts and committed;
// resume.stamp.test.ts fails when the data or the layout changes without
// regenerating it.
export default function ResumePage() {
  return (
    <>
      <PageBand label="Resume" title={RESUME.name} banner="resume" lede={RESUME.headline} className="band-resume">
        <ul className="resume-contact band-contact">
          <li>{RESUME.location}</li>
          <li>
            <a href={`mailto:${RESUME.email}`}>{RESUME.email}</a>
          </li>
          {RESUME.links.map((l) => (
            <li key={l.href}>
              <a href={l.href} rel="noopener">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </PageBand>
      <Container className="resume-shell py-12 sm:py-16">
        <Reveal />
        <p className="resume-download mb-10 flex flex-wrap items-center gap-4" data-print-hide data-reveal>
          <a href="/Caleb-Pham-Resume.pdf" download className="pill pill-primary">
            Download PDF
          </a>
          <span className="text-sm text-muted">Letter size, one page, real text.</span>
        </p>
        <ResumeDocument resume={RESUME} />
      </Container>
    </>
  )
}
