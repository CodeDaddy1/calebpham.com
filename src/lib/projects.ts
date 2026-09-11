// The case-study index. Prose lives in src/content/work/<slug>.mdx; this file
// is everything a surface needs to list, link, and describe a case study
// without opening the prose: the home teasers, /work, the sitemap, the OG
// card, and generateStaticParams all read it.
//
// It holds NO colour values. Each case study's swatch is a
// [data-swatch='<slug>'] block in globals.css so the contrast test can measure
// it; the page sets data-swatch={slug} and the CSS does the rest.

export type ProjectSlug = 'lumaiq' | 'the-ninth-room' | 'mdcb-study'
export type Status = 'published' | 'draft'

export interface Project {
  slug: ProjectSlug
  name: string
  /** One line. Home teaser, /work card, OG subtitle. */
  tagline: string
  role: string
  /** 'YYYY-MM'; end null means ongoing. */
  period: { start: string; end: string | null }
  stack: string[]
  /** Only published items render, build, or enter the sitemap. */
  status: Status
  links: { repo?: string; live?: string }
}

export const PROJECTS: readonly Project[] = [
  {
    slug: 'lumaiq',
    name: 'LumaIQ',
    tagline: 'Asset management software for self-storage operators, built as sole engineer.',
    role: 'Founder and sole engineer',
    period: { start: '2026-04', end: null },
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Supabase Postgres', 'Tailwind CSS 4', 'Vercel'],
    status: 'draft',
    links: { live: 'https://www.lumaiq.dev' },
  },
  {
    slug: 'the-ninth-room',
    name: 'The Ninth Room pipeline',
    tagline: 'A local Python pipeline that turns raw footage into a finished episode in DaVinci Resolve.',
    role: 'Sole engineer',
    period: { start: '2026-06', end: null },
    stack: ['Python 3.9', 'ffmpeg', 'faster-whisper', 'Pillow', 'DaVinci Resolve scripting'],
    status: 'draft',
    links: { repo: 'https://github.com/CodeDaddy1/the-ninth-room' },
  },
  {
    slug: 'mdcb-study',
    name: 'MDCB Study',
    tagline: 'Source-grounded exam preparation: every question cites the passage it came from.',
    role: 'Sole engineer',
    period: { start: '2026-06', end: '2026-06' },
    stack: ['Next.js 16', 'TypeScript', 'Supabase Postgres', 'pgvector', 'Anthropic'],
    status: 'draft',
    links: { repo: 'https://github.com/CodeDaddy1/MDCB_Study' },
  },
]

export const publishedProjects = (): Project[] => PROJECTS.filter((p) => p.status === 'published')

export const getProject = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug && p.status === 'published')
