import type { Metadata } from 'next'
import { preload } from 'react-dom'
import { Stage } from '@/components/cinema/stage'
import { ChapterRail } from '@/components/cinema/chapter-rail'
import { Statement } from '@/components/cinema/statement'
import { Reveal } from '@/components/reveal'
import { Hero, City, Desk, Code, Contact } from '@/components/cinema/chapters'
import { posterSrc } from '@/lib/clips'
import { CHAPTERS } from '@/lib/home'
import { publishedProjects } from '@/lib/projects'
import '../cinema.css'

export const metadata: Metadata = { alternates: { canonical: '/' } }

// The cinema. Five chapters over a fixed stage; the stage, the reveals and
// the statement are the only client code, and they mutate attributes on the
// server-rendered sections rather than owning any of them. The first poster
// is preloaded so it is the largest paint, not the heading's font.
export default function HomePage() {
  preload(posterSrc('city', 900), { as: 'image', fetchPriority: 'high', media: '(max-width: 759px)' })
  preload(posterSrc('city', 1600), { as: 'image', fetchPriority: 'high', media: '(min-width: 760px)' })

  return (
    <div id="cinema" data-chapter="0">
      <Stage chapters={CHAPTERS} />
      <Reveal />
      <Statement />
      <Hero />
      <City />
      <Desk />
      <Code projects={publishedProjects()} />
      <Contact />
      <ChapterRail chapters={CHAPTERS} />
    </div>
  )
}
