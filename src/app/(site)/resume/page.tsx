import type { Metadata } from 'next'
import { Container } from '@/components/container'
import { ResumeDocument } from '@/components/resume/resume-document'
import { RESUME } from '@/lib/resume'

export const metadata: Metadata = {
  title: 'Resume',
  description:
    'The resume of Caleb Pham: Founding Software Engineer at LumaIQ after running seven self-storage properties in Houston. One Letter page, real text, as a PDF.',
  alternates: { canonical: '/resume' },
  openGraph: { url: '/resume' },
}

// The download is an anchor, never a button: a download is a navigation. The
// file is generated from this very page by scripts/build-resume-pdf.ts and
// committed; resume.stamp.test.ts fails when the data or the layout changes
// without regenerating it.
export default function ResumePage() {
  return (
    <Container className="resume-shell py-12 sm:py-16">
      <p className="mb-8 flex flex-wrap items-center gap-4" data-print-hide>
        <a href="/Caleb-Pham-Resume.pdf" download className="pill pill-secondary">
          Download PDF
        </a>
        <span className="text-sm text-muted">Letter size, one page, real text.</span>
      </p>
      <ResumeDocument resume={RESUME} />
    </Container>
  )
}
