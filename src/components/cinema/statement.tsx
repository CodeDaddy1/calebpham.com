'use client'

import { useEffect } from 'react'

// Lights the Desk statement word by word as it scrolls into the reading zone.
// The paragraph is server-rendered with every word in --foreground; this arms
// it (data-statement-ready) only when motion is not reduced, and the CSS dims
// the words that have not been lit yet. No JavaScript means nothing is ever
// dim. The formula is the board's: progress runs from the paragraph's top
// crossing 85 percent of the viewport to it reaching 35 percent, with a lead
// of two words so a word is lit before the eye lands on it.

export function Statement() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // No generics here: the diction test scans .tsx for JSX text and a
    // `<HTMLElement>` followed by a `!` reads as an exclamation mark to it.
    const p = document.querySelector('.statement') as HTMLElement | null
    if (p === null) return
    const words = Array.from(p.querySelectorAll('.sw')) as HTMLElement[]
    const n = words.length
    let raf = 0
    const fx = () => {
      raf = 0
      const r = p.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.5)))
      words.forEach((w, i) => {
        if (progress * (n + 4) > i + 2) w.setAttribute('data-lit', '')
        else w.removeAttribute('data-lit')
      })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(fx) }
    fx()
    p.setAttribute('data-statement-ready', '')
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
      p.removeAttribute('data-statement-ready')
    }
  }, [])

  return null
}
