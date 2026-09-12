import type { ReactNode } from 'react'
import { posterSrc, type ChapterId } from '@/lib/home'
import { Words } from './cinema/words'

// Every inner page opens like a chapter: a still of the home's footage under a
// flat scrim, the tracked label, the heading rising word by word on load, and
// an optional lede a beat later. The entrance is CSS keyframes, so no
// JavaScript runs and nothing flashes; reduced motion renders the final state.
// The band paints --background under the poster so the contrast sweep
// measures text on the ground; src/lib/home.assets.test.ts measures the
// poster itself under the scrim. Muted text never sits on the band: the
// scrim is set for --foreground and --muted-strong only.

export function PageBand({
  label,
  title,
  lede,
  poster = 'city',
  children,
  className = '',
}: {
  label: string
  title: string
  lede?: ReactNode
  poster?: ChapterId
  /** Anything after the lede: a contact row, a meta line. Enters last. */
  children?: ReactNode
  className?: string
}) {
  return (
    <section className={`band ${className}`} data-band>
      {/* A plain img: a cover under a scrim, already cached from the home; next/image would wrap it in layout it does not have. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="band-poster"
        alt=""
        decoding="async"
        srcSet={`${posterSrc(poster, 900)} 900w, ${posterSrc(poster, 1600)} 1600w`}
        sizes="100vw"
        src={posterSrc(poster, 1600)}
      />
      <div className="band-scrim" />
      <div className="band-content">
        <p className="label band-label m-0">{label}</p>
        <h1 className="band-title" data-words-in>
          <Words text={title} step={45} />
        </h1>
        {lede && <p className="band-lede">{lede}</p>}
        {children && <div className="band-after">{children}</div>}
      </div>
    </section>
  )
}
