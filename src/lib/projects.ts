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
  /** One line. /work row, OG subtitle, and the home row when blurb is absent. */
  tagline: string
  /** Two sentences for the home page's project row. */
  blurb?: string
  role: string
  /** 'YYYY-MM'; end null means ongoing. */
  period: { start: string; end: string | null }
  stack: string[]
  /** Only published items render, build, or enter the sitemap. */
  status: Status
  links: { repo?: string; live?: string }
  /** Measured facts for the case-study header, label and value, after the links. */
  facts?: [label: string, value: string][]
}

export const PROJECTS: readonly Project[] = [
  {
    slug: 'lumaiq',
    name: 'LumaIQ',
    tagline: 'Asset management software for self-storage operators, from the store desk to the home office.',
    blurb:
      'Asset management for self-storage operators: rate increases, the lien clock, owner reports and the month-end close, from the store desk to the home office.',
    facts: [
      ['Suite', '2,453 tests in 176 files, on every push'],
      ['Tenancy', 'Postgres with row-level security as the boundary'],
      ['Models', 'Anthropic and OpenAI for documents and decisions'],
    ],
    role: 'Founder and sole engineer',
    period: { start: '2026-04', end: null },
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Supabase Postgres', 'Tailwind CSS 4', 'Vercel'],
    status: 'published',
    links: { live: 'https://www.lumaiq.dev' },
  },
  {
    slug: 'the-ninth-room',
    name: 'The Ninth Room pipeline',
    tagline: 'A Python pipeline that turns raw footage into a cut timeline in DaVinci Resolve.',
    blurb:
      'A Python pipeline that carries raw footage to a cut timeline in DaVinci Resolve, run from one machine.',
    facts: [
      ['Commits', '271, public'],
      ['Tests', '75 files, standard-library unittest'],
    ],
    role: 'Sole engineer',
    period: { start: '2026-06', end: null },
    stack: ['Python 3.9', 'ffmpeg', 'faster-whisper', 'Pillow', 'DaVinci Resolve scripting'],
    status: 'published',
    links: { repo: 'https://github.com/CodeDaddy1/the-ninth-room' },
  },
  {
    slug: 'mdcb-study',
    name: 'MDCB Study',
    tagline: 'Exam preparation where every question cites the passage it came from.',
    blurb:
      'Built for my wife\'s board exam: every question cites the passage it came from.',
    facts: [
      ['Retrieval', 'pgvector, 1,024-dimension embeddings, one SQL function'],
      ['Verification', 'A second model, the cited chunks only, a schema-checked reply'],
    ],
    role: 'Sole engineer',
    period: { start: '2026-06', end: '2026-06' },
    stack: ['Next.js 16', 'TypeScript', 'Supabase Postgres', 'pgvector', 'Anthropic'],
    status: 'published',
    links: { repo: 'https://github.com/CodeDaddy1/MDCB_Study' },
  },
]

export const publishedProjects = (): Project[] => PROJECTS.filter((p) => p.status === 'published')

export const getProject = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug && p.status === 'published')
