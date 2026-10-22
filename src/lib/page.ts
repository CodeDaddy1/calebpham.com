// Every string on the page, in reading order.
//
// The copy was approved by Caleb on 2026-10-20 (mockup v4); the milestones
// were added on 2026-10-21 at his ask ("The OpenAI Plugin, Anthropic
// Connector. We have Filed C Corp as Verillum AI"), and the same day the
// product's name became Verillum AI ("We are no longer LumaIQ, we are
// Verillum AI"), so the page never says LumaIQ (facts.test.ts). Each
// milestone says exactly what has happened, no more: OpenAI approved the
// plugin's first version (Caleb, 2026-10-21: "We were approved for the first
// version of our public plugin and continuing to update and bring new
// features"); the Claude connection is a connector anyone signed in can add,
// not a directory listing; the company is filed. When one of those changes,
// change its line here.
//
// length.test.ts and diction.test.ts read this file; facts.test.ts reads the
// whole tree.

export interface Screen {
  /** A key of screens.json, which scripts/encode-screens.mjs writes. */
  name: 'owner-reports' | 'rate-increases' | 'lien'
  /** The page's own name in the app, as the frame's title bar shows it. */
  title: string
  alt: string
}

export const HERO = {
  eyebrow: 'Founder of Verillum AI · Houston, Texas',
  title: 'I ran storage properties. Then I built the software they needed.',
  lede: 'Verillum AI reads the reports your stores already produce and turns them into owner reports, rate increases and a lien calendar. I run every demo myself.',
  action: 'Book a demo',
} as const

export const MILESTONES = {
  heading: 'Milestones',
  items: [
    {
      source: 'OpenAI',
      title: 'ChatGPT plugin',
      text: 'OpenAI approved the first version of our reporting plugin for ChatGPT. New versions and features follow under the Verillum AI name.',
    },
    {
      source: 'Anthropic',
      title: 'Claude connector',
      text: 'Verillum AI connects to Claude, so a district manager can ask about any store’s month in plain English.',
    },
    {
      source: 'Company',
      title: 'Verillum AI',
      text: 'Filed as a C corporation.',
    },
  ],
} as const

export const JOBS = {
  eyebrow: 'What it does',
  title: 'Three jobs from my own month-end, in one place.',
  items: [
    {
      title: 'Owner reports',
      text: 'Every store’s month in one list: what is missing, what needs a figure by hand, and what is ready to send to the owner.',
      screen: {
        name: 'owner-reports',
        title: 'Owner Reports',
        alt: 'Owner Reports in the Verillum AI demo account: each store marked Missing PDFs, Manual fields or Ready to send.',
      },
    },
    {
      title: 'Rate increases',
      text: 'Each batch of existing-customer increases, measured by the rent it kept after move-outs, not the rent it proposed.',
      screen: {
        name: 'rate-increases',
        title: 'Rate Increases',
        alt: 'Rate Increases in the Verillum AI demo account: outcomes of past batches, rent kept against rent proposed, and move-outs after each increase.',
      },
    },
    {
      title: 'Past due and lien',
      text: 'Every late unit on the lien ladder, each notice dated from the day its clock started.',
      screen: {
        name: 'lien',
        title: 'Past Due and Lien',
        alt: 'Past Due and Lien in the Verillum AI demo account: late units grouped under the lien step each is due for, with overdue notices first.',
      },
    },
  ],
} as const satisfies { eyebrow: string; title: string; items: readonly { title: string; text: string; screen: Screen }[] }

export const ABOUT = {
  eyebrow: 'Who builds it',
  title: 'I did the job before I wrote the software.',
  paragraphs: [
    'I started as a property manager in 2024. Within a year I was an area manager, the link between the store teams and the head of operations.',
    'I closed the month at every store myself and sent the owner reports. Verillum AI is that job as software, built alone and done by hand first.',
  ],
  belief: 'The person who did the job should build the tool.',
} as const

export const DEMO = {
  eyebrow: 'Book a demo',
  title: 'See Verillum AI with the person who built it.',
  steps: [
    'Tell me about your stores on the request form.',
    'I reply within one business day with a time.',
    'I walk you through it on a call, or in person if you are in Houston.',
  ],
  card: {
    title: 'Request a demo',
    text: 'The request form opens on verillumai.com.',
    action: 'Request a demo',
    alt: 'Or write to me at',
  },
} as const
