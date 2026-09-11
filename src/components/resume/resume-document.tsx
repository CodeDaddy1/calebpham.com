import type { Resume } from '@/lib/resume'
import { monthYear } from '@/lib/dates'

// The printable resume. /resume renders this on screen and
// scripts/build-resume-pdf.ts prints the same route to Letter, so the web page
// and the PDF cannot disagree. Single column on purpose: the draft's own note
// is that a single column parses in every applicant tracking system.
//
// Print rules live in globals.css under @media print: no header, no footer,
// no fills, ink #111111, roles never split across a page.

function dates(start: string, end: string | null): string {
  return `${monthYear(start)} to ${end === null ? 'present' : monthYear(end)}`
}

export function ResumeDocument({ resume }: { resume: Resume }) {
  return (
    <div className="resume mx-auto max-w-[72ch]">
      <header>
        <h1 className="text-[2.25rem]">{resume.name}</h1>
        <p className="mt-1 text-[1.125rem] text-muted-strong">{resume.headline}</p>
        <p className="resume-contact mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span>{resume.location}</span>
          <a href={`mailto:${resume.email}`} className="inline-flex min-h-11 items-center">
            {resume.email}
          </a>
          {resume.links.map((l) => (
            <a key={l.href} href={l.href} rel="noopener" className="inline-flex min-h-11 items-center">
              {l.label}
            </a>
          ))}
        </p>
      </header>

      <section className="mt-8">
        <h2 className="text-[1.125rem]">Summary</h2>
        <p className="mt-2">{resume.summary}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-[1.125rem]">Experience</h2>
        <div className="mt-3 space-y-5">
          {resume.roles.map((r) => (
            <div key={`${r.company}-${r.title}-${r.start}`} className="role grid gap-x-6 gap-y-1 md:grid-cols-[10.5rem_1fr]">
              <div className="text-sm text-muted">
                <time className="tnum block">{dates(r.start, r.end)}</time>
                {r.note && <span className="block">{r.note}</span>}
              </div>
              <div>
                <p className="m-0 font-medium">
                  {r.title}
                  <span className="text-muted-strong">, {r.company}</span>
                </p>
                <p className="m-0 text-sm text-muted">{r.location}</p>
                {r.bullets.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {r.bullets.map((b) => (
                      <li key={b.slice(0, 32)}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {resume.education.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[1.125rem]">Education</h2>
          <div className="mt-3 space-y-3">
            {resume.education.map((e) => (
              <div key={`${e.school}-${e.program}`} className="role grid gap-x-6 gap-y-1 md:grid-cols-[10.5rem_1fr]">
                <time className="tnum text-sm text-muted">{dates(e.start, e.end)}</time>
                <div>
                  <p className="m-0 font-medium">{e.program}</p>
                  <p className="m-0 text-sm text-muted">
                    {e.school}
                    {e.note ? `. ${e.note}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="resume-skills mt-8">
        <h2 className="text-[1.125rem]">Skills</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 md:grid-cols-[10.5rem_1fr]">
          {resume.skills.map((g) => (
            <div key={g.label} className="contents">
              <dt className="text-sm text-muted">{g.label}</dt>
              <dd className="m-0">{g.items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
