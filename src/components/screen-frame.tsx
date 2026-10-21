import { getImageProps } from 'next/image'
import type { Screen } from '@/lib/page'

// One LumaIQ screen in the app's own card: a title bar with the page name and
// a Demo data chip, then the capture. Phones get the capture LumaIQ draws at
// phone size (art direction, not a shrunk desktop), so its text stays
// readable; the frame turns phone-shaped there and drops the bar.
//
// Desktop sizes follow the .job grid: two thirds of the 1120px column less
// its gutters and gap is 683px; between 641 and 820 the frame runs the full
// width. The phone frame is 300 CSS px at most.

const DESKTOP = { width: 1600, height: 1000 }
const PHONE = { width: 780, height: 1688 }

export function ScreenFrame({ screen }: { screen: Screen }) {
  const common = { alt: screen.alt, quality: 85 }
  const {
    props: { srcSet: desktop },
  } = getImageProps({
    ...common,
    ...DESKTOP,
    src: `/screens/${screen.name}-desktop.webp`,
    sizes: '(min-width: 1120px) 683px, (min-width: 821px) 62vw, 100vw',
  })
  const {
    props: { srcSet: phone, ...img },
  } = getImageProps({ ...common, ...PHONE, src: `/screens/${screen.name}-phone.webp`, sizes: '300px' })

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
        <source media="(min-width: 641px)" srcSet={desktop} sizes="(min-width: 1120px) 683px, (min-width: 821px) 62vw, 100vw" />
        {/* The art-direction pattern from Next's image docs: next/image cannot
            switch sources by media query, so its props go on a plain img. The
            alt is in the spread, which the lint rule cannot see. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img {...img} />
      </picture>
    </figure>
  )
}
