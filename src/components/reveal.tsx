'use client'

import { useEffect } from 'react'

// One observer for the three kinds of reveal on the site: [data-reveal]
// (opacity and a 14px rise), [data-reveal-words] (each word lifts out of a
// clip), and [data-count] (a figure counts up from zero). An element is marked
// the first time it is in view; the hidden state is armed on <html> only after
// the first callback, so nothing above the fold flashes and no JavaScript
// means everything is visible. Under reduced motion the component returns
// early and every element stays in its final, server-rendered state.

const easeOutQuart = (p: number) => 1 - Math.pow(1 - p, 4)

function countUp(el: HTMLElement) {
  if (el.dataset.done) return
  el.dataset.done = '1'
  const end = Number(el.dataset.count)
  const prefix = el.dataset.prefix ?? ''
  const suffix = el.dataset.suffix ?? ''
  const duration = 1400 // --dur-count
  const t0 = performance.now()
  const step = (t: number) => {
    const p = Math.min(1, (t - t0) / duration)
    el.textContent = prefix + Math.round(end * easeOutQuart(p)).toLocaleString('en-US') + suffix
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export function Reveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-words], [data-count]'))
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          if (el.dataset.count !== undefined) countUp(el)
          else el.setAttribute('data-shown', '')
          observer.unobserve(el)
        }
        // Armed after the first callback, so already-visible elements were
        // marked shown before the hidden state could apply to them.
        document.documentElement.setAttribute('data-reveal-ready', '')
      },
      { threshold: 0.05, rootMargin: '0px 0px -4% 0px' },
    )
    for (const t of targets) observer.observe(t)

    return () => {
      observer.disconnect()
      document.documentElement.removeAttribute('data-reveal-ready')
    }
  }, [])

  return null
}
