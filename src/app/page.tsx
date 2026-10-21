import type { Metadata } from 'next'
import Image from 'next/image'
import { ScreenFrame } from '@/components/screen-frame'
import { ABOUT, DEMO, HERO, JOBS, MILESTONES } from '@/lib/page'
import { SITE } from '@/lib/site'

export const metadata: Metadata = { alternates: { canonical: '/' } }

// The whole site, one page, in the order Caleb ruled on 2026-10-19: who he
// is and the one action, what has happened so far, the three jobs shown on
// real LumaIQ screens, who builds it, and how a demo goes. Every Book a demo
// opens LumaIQ's form. The walk-through video slots in under the hero once
// its final take is recorded.
export default function HomePage() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="wrap">
          <p className="label">{HERO.eyebrow}</p>
          <h1 id="hero-title">{HERO.title}</h1>
          <p className="lede">{HERO.lede}</p>
          <a href={SITE.demo} rel="noopener" className="btn">
            {HERO.action}
          </a>
        </div>
      </section>

      <section className="milestones" aria-labelledby="milestones">
        <div className="wrap">
          <h2 id="milestones" className="label">
            {MILESTONES.heading}
          </h2>
          <ul className="milestone-list">
            {MILESTONES.items.map((m) => (
              <li key={m.title} className="milestone">
                <p className="label">{m.source}</p>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="band" id="what" aria-labelledby="what-title">
        <div className="wrap">
          <div className="head">
            <p className="label">{JOBS.eyebrow}</p>
            <h2 id="what-title">{JOBS.title}</h2>
          </div>
          <div className="jobs">
            {JOBS.items.map((job, i) => (
              <article key={job.title} className="job">
                <div className="job-text">
                  <p className="label">{String(i + 1).padStart(2, '0')}</p>
                  <h3>{job.title}</h3>
                  <p>{job.text}</p>
                </div>
                <ScreenFrame screen={job.screen} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="about" aria-labelledby="about-title">
        <div className="wrap">
          <div className="head">
            <p className="label">{ABOUT.eyebrow}</p>
            <h2 id="about-title">{ABOUT.title}</h2>
          </div>
          <div className="about">
            {/* The only headshot on file is 600 by 800; it renders at 220 CSS px
                at most, so 2x never asks for more than the source has. */}
            <Image src="/team/caleb-pham.jpg" alt={SITE.name} width={600} height={800} sizes="220px" className="portrait" />
            <div className="about-body">
              {ABOUT.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
              <p className="belief">{ABOUT.belief}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="band" id="demo" aria-labelledby="demo-title">
        <div className="wrap demo">
          <div>
            <div className="head">
              <p className="label">{DEMO.eyebrow}</p>
              <h2 id="demo-title">{DEMO.title}</h2>
            </div>
            <ol className="steps">
              {DEMO.steps.map((step, i) => (
                <li key={step}>
                  <span className="step-num label" aria-hidden="true">
                    {i + 1}
                  </span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="request">
            <h3>{DEMO.card.title}</h3>
            <p>{DEMO.card.text}</p>
            <a href={SITE.demo} rel="noopener" className="btn">
              {DEMO.card.action}
            </a>
            <p className="alt">
              {DEMO.card.alt} <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
