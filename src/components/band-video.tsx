'use client'

import { useEffect, useRef } from 'react'
import { type ClipId, videoSrc } from '@/lib/clips'
import { footageGate } from './cinema/footage'

// The clip behind a page band: one video element between the poster and the
// scrim, empty in the server HTML, so the static page never carries a video
// request. After mount, and only while the footage gate (cinema/footage.ts)
// allows it, the clip is attached and played; play() resolving sets data-live
// on the band and the video fades in over the poster.
//
// The clip does not loop on its own. At `ended` the band dips to the ground
// for the design's 600ms (data-dip, the home's chapter-swap move), the clip
// is rewound, and the dip lifts, so the cut from the last frame back to the
// first is never on screen. If the gate closes (the window narrows, motion
// is reduced) the source is dropped and the poster stands.

const DIP = 600 // ms; globals.css --dur-stage

export function BandVideo({ id }: { id: ClipId }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = ref.current
    const band = v?.closest<HTMLElement>('[data-band]')
    if (!v || !band) return
    const { eligible, watch, ext } = footageGate()
    let timer = 0

    const start = () => {
      v.src = videoSrc(id, ext)
      v.preload = 'auto'
      v.muted = true
      v.load()
      v.play()
        .then(() => {
          band.dataset.live = ''
        })
        .catch(() => {})
    }
    const stop = () => {
      window.clearTimeout(timer)
      delete band.dataset.live
      delete band.dataset.dip
      v.pause()
      v.removeAttribute('src')
      v.load()
    }
    const onEnded = () => {
      band.dataset.dip = ''
      timer = window.setTimeout(() => {
        v.currentTime = 0
        v.play().catch(() => {})
        delete band.dataset.dip
      }, DIP)
    }
    const onChange = () => {
      if (!eligible()) stop()
      else if (!v.hasAttribute('src')) start()
    }

    v.addEventListener('ended', onEnded)
    const unwatch = watch(onChange)
    if (eligible()) start()
    return () => {
      v.removeEventListener('ended', onEnded)
      unwatch()
      stop()
    }
  }, [id])

  return <video ref={ref} className="band-video" muted playsInline preload="none" disablePictureInPicture tabIndex={-1} aria-hidden="true" />
}
