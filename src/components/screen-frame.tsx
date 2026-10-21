import { getImageProps } from 'next/image'
import type { Screen } from '@/lib/page'
import SCREENS from '@/lib/screens.json'

// One app screen in the app's own card: a title bar with the page name and a
// Demo data chip, then the capture. Phones get the capture the app draws at
// phone size (art direction, not a shrunk desktop), so its text stays
// readable; the frame turns phone-shaped there and drops the bar.
//
// Desktop sizes follow the .job grid: two thirds of the 1120px column less
// its gutters and gap is 683px; between 641 and 820 the frame runs the full
// width. The phone frame is 300 CSS px at most. Files and their sizes come
// from screens.json, written by scripts/encode-screens.mjs.

const DESKTOP_SIZES = '(min-width: 1120px) 683px, (min-width: 821px) 62vw, 100vw'

export function ScreenFrame({ screen }: { screen: Screen }) {
  const files = SCREENS[screen.name]
  const common = { alt: screen.alt, quality: 85 }
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, ...files.desktop, sizes: DESKTOP_SIZES })
  const {
    props: { srcSet: phone, ...img },
  } = getImageProps({ ...common, ...files.phone, sizes: '300px' })

  return (
    <figure className="frame">
      <figcaption className="frame-bar label">
        <span className="frame-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>{screen.title}</span>
        <span className="chip">Demo data</span>
      </figcaption>
      <picture>
        <source media="(max-width: 640px)" srcSet={phone} sizes="300px" />
        <source media="(min-width: 641px)" srcSet={desktop} sizes={DESKTOP_SIZES} />
        {/* The art-direction pattern from Next's image docs: next/image cannot
            switch sources by media query, so its props go on a plain img. The
            alt is in the spread, which the lint rule cannot see. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img {...img} />
      </picture>
    </figure>
  )
}
