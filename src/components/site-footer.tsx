import { SITE } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p>
          {SITE.name} · {SITE.location}
        </p>
        <ul>
          <li>
            <a href={SITE.lumaiq} rel="noopener">
              lumaiq.dev
            </a>
          </li>
          <li>
            <a href={SITE.linkedin} rel="noopener">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
