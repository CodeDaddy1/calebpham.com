import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image'
import { HERO } from '@/lib/page'
import { SITE } from '@/lib/site'

// The one card, for the one page (and the 404, which inherits it).
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = `${SITE.name}, ${SITE.title}`

export default function Image() {
  return ogImage({
    eyebrow: SITE.title,
    title: HERO.title,
    subtitle: 'Owner reports, rate increases and a lien calendar for self-storage.',
    tags: [SITE.location],
  })
}
