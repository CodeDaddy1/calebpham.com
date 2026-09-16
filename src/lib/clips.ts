// Every piece of footage on the site, by id: the home's three chapters
// (src/lib/home.ts) and the About band's clip. They share one folder
// (public/video), one encoder (scripts/encode-video.mjs), one cache rule
// (next.config.ts: a year, immutable, so a re-encode must change the name)
// and one size budget (src/lib/home.assets.test.ts).

export type ChapterId = 'city' | 'desk' | 'code'
export type ClipId = ChapterId | 'about'

export const videoSrc = (id: ClipId, ext: 'mp4' | 'webm') => `/video/${id}-1080.${ext}`
export const posterSrc = (id: ClipId, width: 900 | 1600) => `/video/${id}-poster-${width}.webp`
