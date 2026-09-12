import { ogImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image'
import { SITE } from '@/lib/site'

// The default card for every page that does not define its own. Next resolves
// opengraph-image down the segment tree, so /, /about, /resume and /work all
// inherit this one.
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = `${SITE.name}, ${SITE.title}`

export default function Image() {
  return ogImage({
    eyebrow: SITE.title,
    title: 'The bridge between the store teams and the home office, built in software.',
    subtitle: SITE.description,
    tags: [SITE.location],
  })
}
