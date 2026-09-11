// The resume, as data. /resume renders it, and public/Caleb-Pham-Resume.pdf is
// a print of that page, so there is one source of truth for every date and
// figure. Source of truth for the wording: the 2026-09-11 draft (Resume
// Variations.pdf), transcribed with only the house-diction edits: em dashes
// removed, $400K written as $400,000, the 87–92% range written as "87 to 92
// percent", and "&" written as "and". Nothing else was reworded. No phone
// number, by decision.
//
// Editing this file without running `npm run resume:pdf` turns the suite red
// (resume.stamp.test.ts), which is how a stale PDF cannot ship.

export interface Role {
  company: string
  title: string
  location: string
  /** 'YYYY-MM' */
  start: string
  /** null renders as Present */
  end: string | null
  /** A short qualifier under the dates, e.g. part-time since a month. */
  note?: string
  bullets: string[]
}

export interface Education {
  school: string
  program: string
  start: string
  end: string | null
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
  summary: string
  roles: Role[]
  /** Empty renders no section. Nothing here is invented. */
  education: Education[]
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
    { label: 'github.com/CodeDaddy1', href: 'https://github.com/CodeDaddy1' },
  ],
  summary:
    'Operator turned founder. After running seven self-storage properties and 4,000 units, I built LumaIQ, the decision layer that sits between a storage management system and the calls an operator actually has to make. Sole engineer, concept through production: Next.js, TypeScript, Supabase Postgres, and LLM tooling.',
  roles: [
    {
      company: 'LumaIQ',
      title: 'Founding Software Engineer',
      location: 'Houston, TX (Remote)',
      start: '2026-04',
      end: null,
      bullets: [
        'Founded and independently built LumaIQ from the ground up, leading the product from concept through architecture, implementation, and deployment.',
        'Built the workflows a management system leaves out: portfolio month-end close, rate increases priced against the move-out they risk, and a lien clock that holds up.',
        'Shipped on Next.js App Router and the Vercel runtime with React, TypeScript, Node, and Supabase Postgres; Anthropic and OpenAI models drive the document and decision workflows.',
      ],
    },
    {
      company: 'The Jenkins Organization',
      title: 'Houston Area Manager',
      location: 'Houston, TX',
      start: '2025-08',
      end: '2026-04',
      bullets: [
        'Led a team of 14 across seven properties and 4,000 units generating roughly $400,000 in monthly revenue.',
        'Held portfolio occupancy at 87 to 92 percent through pricing and delinquency management.',
        'Built the BI reporting the portfolio ran its financial and operational reviews on.',
      ],
    },
    {
      company: 'The Jenkins Organization',
      title: 'Property Manager, then Assistant Manager',
      location: 'Houston, TX',
      start: '2024-10',
      end: null,
      note: 'Part-time since June 2026',
      bullets: [
        'Ran a single property end to end, leasing, collections, and the books, before taking the Houston portfolio.',
      ],
    },
    {
      company: 'Right Move Storage',
      title: 'Area Manager',
      location: 'Houston, TX',
      start: '2026-05',
      end: '2026-05',
      bullets: [],
    },
  ],
  education: [
    { school: 'University of Houston', program: 'BS Computer Science', start: '2024-08', end: null, note: 'Expected 2027' },
    { school: 'Lone Star College', program: 'AS Accounting', start: '2024-01', end: '2026-05' },
  ],
  skills: [
    { label: 'Languages and Frameworks', items: ['TypeScript', 'React', 'Next.js (App Router, Turbopack)', 'Node', 'Tailwind CSS'] },
    { label: 'Data and Infrastructure', items: ['Supabase Postgres', 'Vercel runtime', 'BI reporting'] },
    { label: 'AI', items: ['Anthropic', 'OpenAI'] },
    { label: 'Domain', items: ['Self-storage operations', 'Revenue management', 'Lien compliance', 'Month-end close'] },
  ],
}
