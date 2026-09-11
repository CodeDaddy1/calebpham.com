import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image'
import { SITE } from '@/lib/site'

// The default card for every page that does not define its own. Next resolves
// opengraph-image down the segment tree, so /, /about, /resume, /work and
// /notes all inherit this one.
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = `${SITE.name}, ${SITE.title}`

export default function Image() {
  return ogImage({
    eyebrow: SITE.title,
    title: 'Operator turned software engineer.',
    subtitle: SITE.description,
    tags: [SITE.location],
  })
}
