// The home page as typed data: the three chapters, the stat tiles, the desk
// rows, and every string the cinema says. Prose lives here rather than in
// the components so src/content/diction.test.ts scans it as string literals
// and so the copy can change without touching a component.
//
// Every factual sentence below is either on the verified list (resume, bio,
// case studies) or is Caleb's own board copy. Rows 6 (the city paragraph)
// and 19 (the contact paragraph) are his original lines, signed off on
// 2026-09-12; the other flagged rows ship in their fallback wording.

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
  { label: 'Properties', value: 7 },
  { label: 'Units', value: 4000 },
  { label: 'Occupancy held', range: [87, 92], suffix: '%' },
  { label: 'Monthly revenue, roughly', value: 400000, prefix: '$' },
]

export const DESK_ROWS = [
  {
    number: '01',
    label: 'Operations',
    text: 'Rate strategy, delinquency and lien, month-end close, owner reporting. I know which numbers an owner reads first and which ones a manager is afraid of.',
  },
  {
    number: '02',
    label: 'Engineering',
    text: 'Sole engineer on a multi-tenant product. Postgres with row-level security as the boundary, Next.js on Vercel, TypeScript throughout, and a suite that fails the build when a rule is broken.',
  },
  {
    number: '03',
    label: 'Applied AI',
    text: 'Anthropic and OpenAI models drive the document and decision workflows. In MDCB Study, every question cites the passage it came from.',
  },
] as const

export const HOME_COPY = {
  eyebrow: 'Founder and Software Engineer · Houston, Texas',
  h1: 'I ran seven self-storage properties across Houston. Then I built the software they were missing.',
  lede: 'Seven properties, 4,000 units, and a month-end that lived in spreadsheets. LumaIQ is what I built to replace them: sole engineer, first commit to production.',
  cityLabel: '01 · The City',
  cityH2: 'Where I ran it.',
  cityP: 'Area manager for The Jenkins Organization, accountable for occupancy, delinquency, and the month-end close at every store. This is where the software started, and it is still where I live.',
  deskLabel: '02 · The Desk',
  statement: 'I have closed the month at seven stores and sent the owner reports myself. I build for the person doing that job.',
  codeLabel: '03 · The Code',
  codeH2: 'Then I wrote the software the desk was missing.',
  codeP: 'LumaIQ, built alone from concept through production: Next.js and TypeScript on Vercel, Postgres with row-level security as the boundary, and 2,453 tests that run on every push and fail the build when a rule is broken. The desk decided what to build. The code is how it holds.',
  projectCta: 'Case study',
  contactP: 'I take a small number of advisory and build engagements for self-storage operators, starting with the ones in my own city. If you are in Houston, I will come to the property.',
  contactH2: 'Write to me.',
} as const
