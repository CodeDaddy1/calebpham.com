'use client'

import { useEffect, useState } from 'react'

// Houston time in the header, 24-hour, ticking on the minute. Empty on the
// server: the site is static HTML built once, so a server-rendered time would
// be wrong forever and would disagree with the client at hydration. The
// element reserves five tabular characters (globals.css .clock-time) so the
// fill-in causes no shift, and aria-live is off so the change is never read.

const format = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'America/Chicago',
})

export function Clock() {
  const [text, setText] = useState('')

  useEffect(() => {
    let timer = 0
    const tick = () => {
      setText(format.format(new Date()))
      timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50)
    }
    tick()
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <time className="clock-time tnum" aria-live="off">
      {text}
    </time>
  )
}
