import { SITE } from '@/lib/site'
import { Container } from './container'

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line py-10 text-[0.9375rem] text-muted">
      <Container className="flex flex-wrap items-center justify-between gap-4">
        <p className="m-0">
          {SITE.name}, {SITE.location}
        </p>
        <ul className="m-0 flex list-none gap-6 p-0">
          <li>
            <a href={`mailto:${SITE.email}`} className="hover:text-accent">
              Email
            </a>
          </li>
          <li>
            <a href={SITE.linkedin} rel="noopener" className="hover:text-accent">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={SITE.github} rel="noopener" className="hover:text-accent">
              GitHub
            </a>
          </li>
        </ul>
      </Container>
    </footer>
  )
}
