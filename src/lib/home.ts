// The home page as typed data: the three chapters, the stat tiles, the desk
// rows, and every string the cinema says. Prose lives here rather than in
// the components so src/content/diction.test.ts and length.test.ts scan it,
// and so the copy can change without touching a component.
//
// Every fact below comes from Caleb's own account on 2026-09-12 (the plan's
// interview record) or from a repository measurement. The management
// figures he allows are six properties, two Texas markets, roughly 3,000
// units and roughly 350,000 square feet; src/content/facts.test.ts refuses
// the ones he retired. Rows 6 (cityP) and 19 (contactP) of the earlier copy
// table are his own lines; cityP now names both markets at his correction.

export type ChapterId = 'city' | 'desk' | 'code'

export interface Chapter {
  id: ChapterId
  number: '01' | '02' | '03'
  label: string
  /** Pexels id of the source clip, for scripts/encode-video.mjs and the record. */
  source: number
  /** false renders the poster only; true once the encoded files are committed. */
  video: boolean
}

// Board order: the clip ids follow the design's own list.
export const CHAPTERS: readonly Chapter[] = [
  { id: 'city', number: '01', label: 'The City', source: 18126746, video: true },
  { id: 'desk', number: '02', label: 'The Desk', source: 853844, video: true },
  { id: 'code', number: '03', label: 'The Code', source: 14519236, video: true },
]

export const videoSrc = (id: ChapterId, ext: 'mp4' | 'webm') => `/video/${id}-1080.${ext}`
export const posterSrc = (id: ChapterId, width: 900 | 1600) => `/video/${id}-poster-${width}.webp`

export interface Stat {
  label: string
  /** A single figure that counts up from zero. */
  value?: number
  /** Two figures that count up together, rendered "a to b". */
  range?: [number, number]
  prefix?: string
  suffix?: string
}

export const STATS: readonly Stat[] = [
  { label: 'Properties', value: 6 },
  { label: 'Markets', value: 2 },
  { label: 'Units, roughly', value: 3000 },
  { label: 'Square feet, roughly', value: 350000 },
]

export const DESK_ROWS = [
  {
    number: '01',
    label: 'Revenue',
    text: 'Rate strategy, existing-customer rate increases, occupancy and pricing across both markets.',
  },
  {
    number: '02',
    label: 'Risk',
    text: 'Delinquency, lien compliance, auctions, audits and inspections.',
  },
  {
    number: '03',
    label: 'Reporting',
    text: 'Month-end close, owner reports, and the BI the reviews ran on.',
  },
  {
    number: '04',
    label: 'People',
    text: 'Store-team hiring, training, scheduling and coaching across both markets.',
  },
] as const

export const HOME_COPY = {
  eyebrow: 'Founder and Software Engineer · Houston, Texas',
  h1: 'I was the bridge between six storage properties and the head of operations. Then I built it in software.',
  lede: 'The store teams on one side, the home office on the other, and me carrying the numbers between them. LumaIQ is that job as software: sole engineer, first commit to production.',
  cityLabel: '01 · The City',
  cityH2: 'Where I did the job.',
  cityP: 'Area manager for The Jenkins Organization across the Houston market and the Temple and Killeen market, accountable for occupancy, delinquency, and the month-end close at every store. Houston is where the software started and where I still live.',
  deskLabel: '02 · The Desk',
  statement: 'I have closed the month at every store myself and sent the owner reports. I build for the person doing that job.',
  codeLabel: '03 · The Code',
  codeH2: 'Then I wrote the software the desk was missing.',
  codeP: 'LumaIQ, built alone from concept through production: Next.js and TypeScript on Vercel, Postgres with row-level security as the boundary, 2,453 tests on every push. Anthropic and OpenAI models drive the document and decision workflows.',
  projectCta: 'Case study',
  contactP: 'I take a small number of advisory and build engagements for self-storage operators, starting with the ones in my own city. If you are in Houston, I will come to the property.',
  contactH2: 'Write to me.',
} as const
