import type { Chapter } from '@/lib/home'

// The chapter rail: three anchors, rendered after <main> so it comes last in
// tab order. The active row is whichever chapter the stage has marked
// (aria-current, set by stage.tsx); the CSS draws the longer line from that.
// Smooth scrolling is `scroll-behavior` in globals.css, no JS.

export function ChapterRail({ chapters }: { chapters: readonly Chapter[] }) {
  return (
    <nav className="rail label" aria-label="Chapters">
      {chapters.map((c, i) => (
        <a key={c.id} href={`#${c.id}`} data-index={i} aria-current={i === 0 ? 'true' : undefined}>
          <span>{c.number}</span>
          <span className="rail-label">{c.label}</span>
        </a>
      ))}
    </nav>
  )
}
