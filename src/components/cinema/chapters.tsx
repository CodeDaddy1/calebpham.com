import { Fragment } from 'react'
import { DESK_ROWS, HOME_COPY, STATS } from '@/lib/home'
import { SITE } from '@/lib/site'
import type { Project } from '@/lib/projects'
import { ProjectRow } from '@/components/project-row'
import { Stat } from '@/components/stat'
import { Words } from './words'

// The five chapters of the home page, all server components reading typed
// data from src/lib/home.ts. Motion attributes (data-reveal, data-reveal-words,
// data-count) are read by reveal.tsx; the chapter index on each section is
// read by stage.tsx. Nothing here ships JavaScript.

export function Hero() {
  return (
    <section className="chapter chapter-hero" data-chapter-section data-chapter="0" aria-labelledby="hero-title">
      <div className="chapter-column hero-in">
        <p className="label rule-eyebrow m-0">{HOME_COPY.eyebrow}</p>
        <h1 id="hero-title" className="mt-6">
          {HOME_COPY.h1}
        </h1>
        <p className="lede mt-7">{HOME_COPY.lede}</p>
      </div>
    </section>
  )
}

export function City() {
  return (
    <section className="chapter" data-chapter-section data-chapter="0" id="city" aria-labelledby="city-title">
      <div className="chapter-column">
        <p className="label m-0" data-reveal>
          {HOME_COPY.cityLabel}
        </p>
        <h2 id="city-title" className="mt-5" data-reveal style={{ transitionDelay: '80ms' }}>
          {HOME_COPY.cityH2}
        </h2>
        <p className="chapter-p" data-reveal style={{ transitionDelay: '140ms' }}>
          {HOME_COPY.cityP}
        </p>
        <div className="stats">
          {STATS.map((s) => (
            <Stat key={s.label} stat={s} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function Desk() {
  return (
    <section className="chapter" data-chapter-section data-chapter="1" id="desk" aria-labelledby="desk-title">
      <div className="chapter-column">
        <p className="label m-0" data-reveal>
          {HOME_COPY.deskLabel}
        </p>
        <h2 id="desk-title" className="statement">
          {HOME_COPY.statement.split(' ').map((word, i) => (
            <Fragment key={i}>
              <span className="sw">{word}</span>{' '}
            </Fragment>
          ))}
        </h2>
        <div className="rows">
          {DESK_ROWS.map((r, i) => (
            <div key={r.number} className="row" data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
              <p className="label m-0">
                {r.number} {r.label}
              </p>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Code({ projects }: { projects: readonly Project[] }) {
  return (
    <section className="chapter" data-chapter-section data-chapter="2" id="code" aria-labelledby="code-title">
      <div className="chapter-column glass">
        <p className="label m-0" data-reveal>
          {HOME_COPY.codeLabel}
        </p>
        <h2 id="code-title" className="mt-5" data-reveal-words>
          <Words text={HOME_COPY.codeH2} step={45} />
        </h2>
        <p className="chapter-p" data-reveal style={{ transitionDelay: '120ms' }}>
          {HOME_COPY.codeP}
        </p>
        <ol className="projects">
          {projects.map((p, i) => (
            <li key={p.slug} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
              <ProjectRow project={p} index={i} cta={HOME_COPY.projectCta} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section className="chapter chapter-contact" data-chapter-section data-chapter="2" id="contact" aria-labelledby="contact-title">
      <div className="chapter-column">
        <p className="lede m-0" data-reveal>
          {HOME_COPY.contactP}
        </p>
        <h2 id="contact-title" className="display-contact" data-reveal-words>
          <Words text={HOME_COPY.contactH2} step={70} />
        </h2>
        <div className="contact-links label" data-reveal>
          <a href={`mailto:${SITE.email}`} className="primary">
            {SITE.email}
          </a>
          <a href={SITE.linkedin} rel="noopener">
            LinkedIn
          </a>
        </div>
        <p className="colophon label m-0">
          {SITE.name} · {SITE.location} · {SITE.title}
        </p>
      </div>
    </section>
  )
}
