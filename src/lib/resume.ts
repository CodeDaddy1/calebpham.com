// The resume as data. src/components/resume/resume-document.tsx renders it,
// /resume shows it, and scripts/build-resume-pdf.mts prints the same page to
// public/Caleb-Pham-Resume.pdf. Editing this file without running
// `npm run resume:pdf` turns resume.stamp.test.ts red.
//
// Source: Caleb's own account on 2026-09-12 (the plan's interview record).
// The only management figures he allows are six properties, two Texas
// markets, 3,000 units and 350,000 square feet, stated plainly; the earlier
// draft's revenue, occupancy, unit count and team size are retired and
// src/content/facts.test.ts refuses them. House diction: no dashes, no
// exclamation marks, numbers in full, "to" for ranges, "and" not "&". No
// phone number, no education section, no one-month role.

/** A plain sentence, or a tracked label set before the sentence ("Revenue", "Risk"). */
export type Bullet = string | { label: string; text: string }

export interface Role {
  company: string
  title: string
  location: string
  /** 'YYYY-MM' */
  start: string
  /** null renders as present */
  end: string | null
  /** A short qualifier after the location, e.g. part-time since a month. */
  note?: string
  bullets: Bullet[]
}

/** One cell of the strip under the summary: a label over a figure. */
export interface Fact {
  label: string
  /** The figure or a short phrase; set in tabular figures. */
  value: string
  /** A quiet qualifier under the figure: "Texas", "on every push". */
  note?: string
}

export interface SkillGroup {
  label: string
  items: string[]
}

export interface Resume {
  name: string
  headline: string
  location: string
  email: string
  links: { label: string; href: string }[]
  /** Two sentences. */
  summary: string
  /** Six, in order; three by two on a phone, six across on paper. */
  facts: Fact[]
  roles: Role[]
  skills: SkillGroup[]
}

export const RESUME: Resume = {
  name: 'Caleb Pham',
  headline: 'Founder and Software Engineer, Proptech',
  location: 'Houston, TX',
  email: 'caleb@lumaiq.dev',
  links: [
    { label: 'calebpham.com', href: 'https://calebpham.com' },
    { label: 'linkedin.com/in/caleb-pham-1b8464252', href: 'https://www.linkedin.com/in/caleb-pham-1b8464252' },
  ],
  summary:
    'Area manager for six self-storage properties in two Texas markets, the bridge between the store teams and the head of operations. LumaIQ is that bridge as software, built alone from concept through production.',
  facts: [
    { label: 'Properties', value: '6' },
    { label: 'Markets', value: '2', note: 'Texas' },
    { label: 'Units', value: '3,000' },
    { label: 'Square feet', value: '350,000' },
    { label: 'Engineering', value: 'Sole engineer' },
    { label: 'Tests', value: '2,453', note: 'on every push' },
  ],
  roles: [
    {
      company: 'LumaIQ',
      title: 'Founding Software Engineer',
      location: 'Houston, TX (remote)',
      start: '2026-04',
      end: null,
      bullets: [
        'Built LumaIQ alone, concept through production: Next.js App Router on Vercel, TypeScript, Supabase Postgres with row-level security as the tenant boundary.',
        'Shipped the desks a management system leaves out: rate increases, delinquency and lien, owner reports, month-end close, audits and field ops.',
        'Anthropic and OpenAI models drive the document and decision workflows; the suite runs on every push and fails the build when a rule breaks.',
      ],
    },
    {
      company: 'The Jenkins Organization',
      title: 'Area Manager',
      location: 'Houston, TX, and Temple and Killeen, TX',
      start: '2025-08',
      end: '2026-04',
      bullets: [
        'Reported to the district manager and the VP of Operations; carried what the store teams needed from the office and what the office needed from the field.',
        { label: 'Revenue', text: 'Rate strategy, existing-customer rate increases, occupancy and pricing across both markets.' },
        { label: 'Risk', text: 'Delinquency, lien compliance, auctions, audits and inspections.' },
        { label: 'Reporting', text: 'Month-end close, owner reports, and the BI the reviews ran on.' },
        { label: 'People', text: 'Store-team hiring, training, scheduling and coaching across both markets.' },
      ],
    },
    {
      company: 'The Jenkins Organization',
      title: 'Property Manager, then Assistant Manager',
      location: 'Houston, TX',
      start: '2024-10',
      end: null,
      note: 'Part-time since June 2026',
      bullets: ['Ran a single property end to end: leasing, collections, and the books.'],
    },
  ],
  skills: [
    { label: 'Languages and Frameworks', items: ['TypeScript', 'React', 'Next.js App Router', 'Node', 'Tailwind CSS'] },
    { label: 'Data and Infrastructure', items: ['Supabase Postgres', 'Vercel', 'BI reporting'] },
    { label: 'AI', items: ['Anthropic', 'OpenAI'] },
    { label: 'Domain', items: ['Self-storage operations', 'Revenue management', 'Lien compliance', 'Month-end close'] },
  ],
}
