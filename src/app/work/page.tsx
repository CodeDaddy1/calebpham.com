import type { Metadata } from 'next'
import { Container } from '@/components/container'
import { ProjectTeaser } from '@/components/project-teaser'
import { publishedProjects } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Case studies: what was built, the decisions behind it, and what breaks if they are wrong.',
  alternates: { canonical: '/work' },
}

// Exists so a reader who trims /work/lumaiq to /work does not land on a 404.
// It renders the same teasers as the home page.
export default function WorkPage() {
  return (
    <Container className="py-16 sm:py-24">
      <p className="eyebrow">Work</p>
      <h1 className="mt-3">Case studies</h1>
      <p className="mt-4 max-w-[52ch] text-muted-strong">
        What was built, the decisions behind it, and what breaks if they are wrong.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {publishedProjects().map((p) => (
          <ProjectTeaser key={p.slug} project={p} />
        ))}
      </div>
    </Container>
  )
}
