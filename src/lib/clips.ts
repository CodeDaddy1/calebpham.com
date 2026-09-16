// Every piece of footage on the site, by id: the home's three chapters
// (src/lib/home.ts) and the About band's clip. They share one folder
// (public/video), one encoder (scripts/encode-video.mjs), one cache rule
// (next.config.ts: a year, immutable, so a re-encode must change the name)
// and one size budget (src/lib/home.assets.test.ts).

export type ChapterId = 'city' | 'desk' | 'code'
export type ClipId = ChapterId | 'about'
/** 1080 for every clip; 720 only where the encoder's `phone` block made one. */
export type ClipSize = 1080 | 720

export const videoSrc = (id: ClipId, ext: 'mp4' | 'webm', size: ClipSize = 1080) => `/video/${id}-${size}.${ext}`
export const posterSrc = (id: ClipId, width: 900 | 1600) => `/video/${id}-poster-${width}.webp`
