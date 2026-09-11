import Link from 'next/link'
import type { Project } from '@/lib/projects'
import { period } from '@/lib/dates'

// One case study, as a card. Used by the home page and /work; the same
// component so the two cannot describe a project differently.
// `headingLevel` follows the page: h3 under a section h2 on the home page, h2 under
// the h1 on /work, so the outline never skips a level.
export function ProjectTeaser({ project, headingLevel = 'h3' }: { project: Project; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel
  return (
    <article className="rounded-md border border-line bg-card p-6 sm:p-7">
      <p className="eyebrow">{period(project.period.start, project.period.end)}</p>
      <Heading className="mt-2 font-serif text-[1.5rem] font-medium leading-tight">
        <Link href={`/work/${project.slug}`} className="text-foreground no-underline hover:text-accent">
          {project.name}
        </Link>
      </Heading>
      <p className="mt-3 text-muted-strong">{project.tagline}</p>
      <p className="mt-4 text-sm text-muted">
        {project.role}. {project.stack.join(', ')}.
      </p>
      <p className="mt-5">
        <Link href={`/work/${project.slug}`} className="text-accent underline underline-offset-4">
          Read the case study
        </Link>
      </p>
    </article>
  )
}
