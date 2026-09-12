import type { Bullet, Resume, Role } from '@/lib/resume'
import { monthYearShort } from '@/lib/dates'

// The printable resume. /resume renders this on screen and
// scripts/build-resume-pdf.mts prints the same route to Letter, so the web
// page and the PDF cannot disagree. One column in reading order, so an
// applicant tracking system reads it the way a person does: header, summary,
// facts, experience, skills. Structure is hairlines and type, never a fill,
// because the PDF is printed without backgrounds.
//
// Every element carries a resume-* class. The screen rules and the print
// block in globals.css are keyed to those names and nothing else, so a
// utility class here can never change the paper layout by accident.

function DateRail({ role }: { role: Role }) {
  // Two stacked lines beside the role from 40rem; one line below it. The
  // literal space is what makes the one-line form read as a range.
  return (
    <p className="resume-rail label tnum">
      <time dateTime={role.start}>{monthYearShort(role.start)}</time>{' '}
      {role.end === null ? <span>to present</span> : <time dateTime={role.end}>to {monthYearShort(role.end)}</time>}
    </p>
  )
}

function BulletItem({ bullet }: { bullet: Bullet }) {
  if (typeof bullet === 'string') return <li>{bullet}</li>
  return (
    <li>
      <span className="resume-bullet-label label">{bullet.label}</span> {bullet.text}
    </li>
  )
}

export function ResumeDocument({ resume }: { resume: Resume }) {
  return (
    <div className="resume">
      {/* On screen the page band above carries this; in print the band is hidden and this stands. */}
      <header className="resume-header" data-screen-hide>
        <h1 className="resume-name wdth-84">{resume.name}</h1>
        <p className="resume-headline">{resume.headline}</p>
        <ul className="resume-contact">
          <li>{resume.location}</li>
          <li>
            <a href={`mailto:${resume.email}`}>{resume.email}</a>
          </li>
          {resume.links.map((l) => (
            <li key={l.href}>
              <a href={l.href} rel="noopener">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </header>

      <p className="resume-summary" data-reveal>
        {resume.summary}
      </p>

      <dl className="resume-facts" data-reveal>
        {resume.facts.map((f, i) => (
          <div key={f.label} className="resume-fact" style={{ '--i': i } as React.CSSProperties}>
            <dt className="label">{f.label}</dt>
            <dd className="resume-fact-value tnum">
              {f.value}
              {f.note && <span className="resume-fact-note">{f.note}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <section className="resume-section">
        <h2 className="resume-section-title label" data-reveal>
          Experience
        </h2>
        {resume.roles.map((r, i) => (
          <article key={`${r.company}-${r.title}-${r.start}`} className="resume-role" data-reveal style={{ '--i': i } as React.CSSProperties}>
            <DateRail role={r} />
            <div className="resume-role-body">
              <h3 className="resume-role-title">{r.title}</h3>
              <p className="resume-role-meta">
                <span className="resume-role-company">{r.company}</span>
                <span>{r.location}</span>
                {r.note && <span>{r.note}</span>}
              </p>
              {r.bullets.length > 0 && (
                <ul className="resume-bullets">
                  {r.bullets.map((b) => (
                    <BulletItem key={typeof b === 'string' ? b.slice(0, 32) : b.label} bullet={b} />
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="resume-section">
        <h2 className="resume-section-title label" data-reveal>
          Skills
        </h2>
        <dl className="resume-skills">
          {resume.skills.map((g, i) => (
            <div key={g.label} className="resume-skill" data-reveal style={{ '--i': i } as React.CSSProperties}>
              <dt className="label">{g.label}</dt>
              <dd>{g.items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
