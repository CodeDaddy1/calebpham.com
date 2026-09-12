// The site's own address and identity.
//
// SITE_URL is needed in three places that cannot share a request: metadataBase
// (which turns relative OG image paths into the absolute URLs crawlers
// require), sitemap.ts, and robots.ts. A wrong value here does not break a
// page. It silently publishes links to the wrong host, which is worse, so it is
// derived once and read everywhere.
//
// NEXT_PUBLIC_SITE_URL wins because a preview deployment may want to describe
// itself. VERCEL_PROJECT_PRODUCTION_URL is the stable production hostname
// (unlike VERCEL_URL, which changes per deployment); once the custom domain is
// attached it is the apex. The fallback is the apex.

const FALLBACK = 'https://calebpham.com'

/** An env-shaped bag (process.env or a test literal); the resolver reads two keys. */
export type SiteUrlEnv = Readonly<Record<string, string | undefined>>

export function resolveSiteUrl(env: SiteUrlEnv): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')

  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`

  return FALLBACK
}

export const SITE_URL = resolveSiteUrl(process.env)

/** An absolute URL for a path on this site. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export const SITE = {
  name: 'Caleb Pham',
  title: 'Founder and Software Engineer, Proptech',
  location: 'Houston, TX',
  email: 'caleb@lumaiq.dev',
  linkedin: 'https://www.linkedin.com/in/caleb-pham-1b8464252',
  github: 'https://github.com/CodeDaddy1',
  description:
    'Founder and software engineer in Houston. Six storage properties in two Texas markets, then LumaIQ, built alone: the bridge between store desk and home office.',
} as const
