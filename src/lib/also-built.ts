// The home page's "also built" list: one line each, no case study, and only
// links that answer 200 to an anonymous request (checked in the launch
// matrix). Approved by Caleb on 2026-09-11: RevStor and competitor-scraper are
// omitted because both scrape competitor sites and LumaIQ's public position is
// that nothing it ships does; LumaIQ-Landing is omitted because its URL is
// dead.

export interface AlsoBuilt {
  name: string
  oneLiner: string
  year: string
  href?: string
}

export const ALSO_BUILT: readonly AlsoBuilt[] = [
  {
    name: 'Trip Theory',
    oneLiner: 'Advisor-curated Japan itineraries drafted with AI for family trips.',
    year: 'May 2026',
    href: 'https://triptheory.vercel.app',
  },
]
