// When footage may play at all: one answer for the home's stage and the
// About band, so a metered link or a reduced-motion setting never fetches a
// clip. Under 760px a caller that passes `phones` plays too, and `size`
// tells it to fetch the 720 encode there (both callers do, since
// 2026-09-16); without `phones` a narrow viewport gets the still. Read at
// mount and again whenever a query flips.

import type { ClipSize } from '@/lib/clips'

type Conn = { saveData?: boolean; effectiveType?: string }

export interface FootageGate {
  /** True while every condition holds. */
  eligible: () => boolean
  /** Runs the callback when a condition may have changed; returns the unsubscribe. */
  watch: (cb: () => void) => () => void
  /** The encode this browser plays: VP9 where it is certain, H.264 otherwise. */
  ext: 'mp4' | 'webm'
  /** 720 under 760px, 1080 from there up. */
  size: () => ClipSize
}

export function footageGate({ phones = false }: { phones?: boolean } = {}): FootageGate {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
  const data = window.matchMedia('(prefers-reduced-data: reduce)')
  const wide = window.matchMedia('(min-width: 760px)')
  const conn = (navigator as Navigator & { connection?: Conn }).connection
  const slow = !!conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g'
  const queries = [reduce, data, wide]
  return {
    eligible: () => !reduce.matches && !data.matches && !slow && (phones || wide.matches),
    watch: (cb) => {
      for (const q of queries) q.addEventListener('change', cb)
      return () => {
        for (const q of queries) q.removeEventListener('change', cb)
      }
    },
    ext: document.createElement('video').canPlayType('video/webm; codecs="vp9"') === 'probably' ? 'webm' : 'mp4',
    size: () => (wide.matches ? 1080 : 720),
  }
}
