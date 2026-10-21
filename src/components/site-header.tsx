import Link from 'next/link'
import { HERO } from '@/lib/page'
import { SITE } from '@/lib/site'

// The sticky header: the name, and the one thing a visitor can do here.
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="site-name">
          {SITE.name}
        </Link>
        <a href={SITE.demo} rel="noopener" className="btn">
          {HERO.action}
        </a>
      </div>
    </header>
  )
}
