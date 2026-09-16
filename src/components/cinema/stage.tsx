'use client'

import { useEffect, useRef } from 'react'
import { posterSrc, videoSrc } from '@/lib/clips'
import type { Chapter } from '@/lib/home'
import { footageGate } from './footage'

// The fixed layer behind the home page: a poster, two video elements, and the
// scrim. Nothing here is in the server HTML but the poster, so the static page
// never carries a video request. After mount, and only while the footage
// gate (./footage.ts) allows it, the current chapter's clip is attached and
// played, the 720 encode under 760px and 1080 from there up; a refused
// play() leaves the poster. Scrolling picks the chapter
// whose section is nearest the viewport middle and swaps the clip through a
// 600ms dip to black, the design's own move. Two elements mean the next clip
// buffers while the live one fades.

export function Stage({ chapters }: { chapters: readonly Chapter[] }) {
  const img = useRef<HTMLImageElement>(null)
  const small = useRef<HTMLSourceElement>(null)
  const a = useRef<HTMLVideoElement>(null)
  const b = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const root = document.getElementById('cinema')
    if (!root) return
    const { eligible, watch, ext, size } = footageGate({ phones: true })
    const els = [a.current, b.current]
    const src = (i: number) => videoSrc(chapters[i].id, ext, size())

    let live = -1 // which video element is on screen
    let shown = 0 // the chapter on the stage
    let active = 0 // the chapter nearest the viewport middle
    let swapping = false

    const play = (v: HTMLVideoElement, i: number) => {
      v.src = src(i)
      v.preload = 'auto'
      v.muted = true
      v.load()
      return v.play()
    }
    const setPoster = (i: number) => {
      if (small.current) small.current.srcset = posterSrc(chapters[i].id, 900)
      if (img.current) img.current.src = posterSrc(chapters[i].id, 1600)
    }
    const stop = () => {
      delete root.dataset.live
      live = -1
      for (const v of els) if (v) { v.pause(); v.removeAttribute('src'); v.load() }
    }
    const start = (i: number) => {
      const next = live === 0 ? 1 : 0
      const v = els[next]
      if (!v) return
      const previous = live >= 0 ? els[live] : null
      play(v, i)
        .then(() => {
          root.dataset.live = next === 0 ? 'a' : 'b'
          live = next
          previous?.pause() // it has faded out; no reason to keep decoding it
        })
        .catch(() => {})
    }
    const show = (i: number) => {
      if (shown === i || swapping) return
      swapping = true
      delete root.dataset.live
      root.dataset.dip = ''
      window.setTimeout(() => {
        shown = i
        setPoster(i)
        delete root.dataset.dip
        if (eligible() && chapters[i].video) start(i)
        else live = -1
        swapping = false
        if (active !== shown) show(active)
      }, 600)
    }

    if (eligible() && chapters[0].video) start(0)

    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter-section]'))
    const rail = Array.from(document.querySelectorAll<HTMLElement>('.rail a'))
    let raf = 0
    const fx = () => {
      raf = 0
      const mid = window.innerHeight / 2
      let best = 0
      let dist = Infinity
      for (const s of sections) {
        const r = s.getBoundingClientRect()
        const d = Math.abs(Math.min(Math.max(mid, r.top), r.bottom) - mid)
        if (d < dist) { dist = d; best = Number(s.dataset.chapter) }
      }
      if (best === active) return
      active = best
      root.dataset.chapter = String(best)
      for (const l of rail) {
        if (Number(l.dataset.index) === best) l.setAttribute('aria-current', 'true')
        else l.removeAttribute('aria-current')
      }
      show(best)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(fx) }
    // A resize across 760px changes the file a chapter wants; restart it
    // through the same crossfade a chapter swap uses.
    const onChange = () => {
      if (!eligible()) stop()
      else if (chapters[shown].video && (live < 0 || els[live]?.getAttribute('src') !== src(shown))) start(shown)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const unwatch = watch(onChange)
    fx()

    return () => {
      window.removeEventListener('scroll', onScroll)
      unwatch()
      if (raf) cancelAnimationFrame(raf)
      stop()
    }
  }, [chapters])

  const first = chapters[0].id
  return (
    <div className="stage" data-stage aria-hidden="true">
      {/* A <picture> chosen by viewport, not pixel density: a phone at 2.6x
          would otherwise fetch the 1600px file for a frame it shows under a
          scrim. The two files are also preloaded by media in page.tsx. */}
      <picture>
        <source ref={small} media="(max-width: 759px)" srcSet={posterSrc(first, 900)} />
        {/* A plain img on purpose: a fixed cover layer swapped by hand; next/image would wrap it in layout it does not have. */}
        <img ref={img} className="stage-poster" alt="" decoding="async" fetchPriority="high" src={posterSrc(first, 1600)} />
      </picture>
      <video ref={a} className="stage-video" data-role="a" muted playsInline loop preload="none" disablePictureInPicture tabIndex={-1} />
      <video ref={b} className="stage-video" data-role="b" muted playsInline loop preload="none" disablePictureInPicture tabIndex={-1} />
      <div className="scrim" />
    </div>
  )
}
