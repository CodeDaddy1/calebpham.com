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
        <Link href="/" className="font-serif text-[1.25rem] font-medium text-foreground no-underline">
          {SITE.name}
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-6 text-[0.9375rem]">
          <Link href="/work" className="text-muted-strong no-underline hover:text-accent">
            Work
          </Link>
          <Link href="/notes" className="text-muted-strong no-underline hover:text-accent">
            Notes
          </Link>
          <Link href="/about" className="text-muted-strong no-underline hover:text-accent">
            About
          </Link>
          <Link href="/resume" className="text-muted-strong no-underline hover:text-accent">
            Resume
          </Link>
        </nav>
      </Container>
    </header>
  )
}
