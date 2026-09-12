import Link from 'next/link'
import { SITE } from '@/lib/site'
import { Clock } from './clock'
import { NavMenu } from './nav-menu'

// The fixed header on every page: name, the Houston clock, and four small
// tracked links. Above 760px the links sit inline; below, they collapse into
// a native disclosure menu. `overVideo` makes it transparent over the home
// page's stage; everywhere else it is solid on the ground with a hairline.

const LINKS = [
  ['/work', 'Work'],
  ['/about', 'About'],
  ['/resume', 'Resume'],
] as const

function NavLinks({ className }: { className: string }) {
  return (
    <ul className={className}>
      {LINKS.map(([href, label]) => (
        <li key={href}>
          <Link href={href} className="nav-link">
            {label}
          </Link>
        </li>
      ))}
      <li>
        <a href={`mailto:${SITE.email}`} className="nav-link">
          Contact
        </a>
      </li>
    </ul>
  )
}

export function SiteHeader({ overVideo = false }: { overVideo?: boolean }) {
  return (
    <header className="site-header label" data-print-hide data-over-video={overVideo || undefined}>
      <Link href="/" className="nav-link site-header-name">
        {SITE.name}
      </Link>
      <span className="site-header-clock">
        Houston · <Clock />
      </span>
      <nav aria-label="Primary">
        <NavLinks className="nav-inline" />
        <NavMenu>
          <NavLinks className="nav-menu-list" />
        </NavMenu>
      </nav>
    </header>
  )
}
