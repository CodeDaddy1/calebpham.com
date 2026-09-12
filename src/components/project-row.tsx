import Link from 'next/link'
import type { Project } from '@/lib/projects'

// One project as a numbered hairline row: the home page's Code chapter and
// /work use the same component so the two cannot describe a project
// differently. The arrow is decoration; the link text is the call to action.

export function ProjectRow({ project, index, cta = 'Case study' }: { project: Project; index: number; cta?: string }) {
  return (
    <Link href={`/work/${project.slug}`} className="project-row">
      <span className="label num">{String(index + 1).padStart(2, '0')}</span>
      <span>
        <span className="project-row-name">{project.name}</span>
        <span className="project-row-line">{project.blurb ?? project.tagline}</span>
      </span>
      <span className="label cta">
        {cta} <span aria-hidden="true">→</span>
      </span>
    </Link>
  )
}
