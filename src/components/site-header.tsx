import Link from 'next/link'
import { SITE } from '@/lib/site'
import { Container } from './container'

// Navigation items land here as their routes come to exist: typedRoutes
// rejects an href to a page that is not on disk yet, so the list grows with
// the phases; all four exist now.
export function SiteHeader() {
  return (
    <header className="border-b border-line" data-print-hide>
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="inline-flex min-h-11 items-center text-[1.125rem] font-medium text-foreground no-underline">
          {SITE.name}
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-6 text-[0.9375rem]">
          <Link href="/work" className="inline-flex min-h-11 items-center text-muted-strong no-underline hover:text-accent">
            Work
          </Link>
          <Link href="/notes" className="inline-flex min-h-11 items-center text-muted-strong no-underline hover:text-accent">
            Notes
          </Link>
          <Link href="/about" className="inline-flex min-h-11 items-center text-muted-strong no-underline hover:text-accent">
            About
          </Link>
          <Link href="/resume" className="inline-flex min-h-11 items-center text-muted-strong no-underline hover:text-accent">
            Resume
          </Link>
        </nav>
      </Container>
    </header>
  )
}
