import type { ReactNode } from 'react'
import { posterSrc, type ChapterId, type ClipId } from '@/lib/clips'
import { BANNERS, bannerSrc, type BannerSlug } from '@/lib/banners'
import { BandVideo } from './band-video'
import { Words } from './cinema/words'

// Every inner page opens like a chapter: a still under a flat scrim, the
// tracked label, the heading rising word by word on load, and an optional
// lede a beat later. The entrance is CSS keyframes, so no JavaScript runs
// and nothing flashes; reduced motion renders the final state. The band
// paints --background under the poster so the contrast sweep measures text
// on the ground; src/lib/home.assets.test.ts measures the poster itself
// under the scrim. Muted text never sits on the band: the scrim is set for
// --foreground and --muted-strong only.
//
// A band given `video` plays that clip over its own poster frame, in the
// browser only and under the footage gate (band-video.tsx); its scrim is
// the darker --band-scrim-video, set to hide the clip's flaws rather than
// for contrast, which the frame clears at either alpha.

export function PageBand({
  label,
  title,
  lede,
  banner,
  video,
  poster = 'city',
  children,
  className = '',
}: {
  label: string
  title: string
  lede?: ReactNode
  /** A committed Pexels photo (src/lib/banners.ts), chosen for the page. */
  banner?: BannerSlug
  /** A clip (src/lib/clips.ts) played behind the band; its poster frame is the still. */
  video?: ClipId
  /** Fallback when neither is chosen: one of the home's poster frames. */
  poster?: ChapterId
  /** Anything after the lede: a contact row, a meta line. Enters last. */
  children?: ReactNode
  className?: string
}) {
  const src = (w: 900 | 1600) => (video ? posterSrc(video, w) : banner && banner in BANNERS ? bannerSrc(banner, w) : posterSrc(poster, w))
  return (
    <section className={`band ${className}`} data-band data-video={video ? '' : undefined}>
      {/* A plain img: a cover under a scrim; next/image would wrap it in layout it does not have. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="band-poster"
        alt=""
        decoding="async"
        srcSet={`${src(900)} 900w, ${src(1600)} 1600w`}
        sizes="100vw"
        src={src(1600)}
      />
      {video && <BandVideo id={video} />}
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
