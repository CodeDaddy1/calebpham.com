'use client'

import { useEffect } from 'react'

// The one client component besides Analytics. Marks each [data-reveal]
// element shown the first time it is 20 percent visible, and only then arms
// the hidden state on <html>, so nothing above the fold ever flashes and no
// JavaScript means everything is visible. Returns early under reduced motion.
// Under 1 KB.

export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-shown', '')
            observer.unobserve(entry.target)
          }
        }
        // Armed after the first callback, so already-visible figures were
        // marked shown before the hidden state could apply to them.
        document.documentElement.setAttribute('data-reveal-ready', '')
      },
      { threshold: 0.2 },
    )
    for (const t of targets) observer.observe(t)

    return () => {
      observer.disconnect()
      document.documentElement.removeAttribute('data-reveal-ready')
    }
  }, [])

  return null
}
