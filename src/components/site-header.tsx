import Link from 'next/link'
import { SITE } from '@/lib/site'
import { Container } from './container'

// Navigation items land here in Phase 1 as their routes come to exist:
// typedRoutes rejects an href to a page that is not on disk yet.
export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-[1.25rem] font-medium text-foreground no-underline">
          {SITE.name}
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-6 text-[0.9375rem]" />
      </Container>
    </header>
  )
}
