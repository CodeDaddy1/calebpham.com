'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

// The phone header's menu: a native <details>, so it opens without JavaScript
// and carries its own keyboard and screen-reader semantics. The one piece of
// JS closes it after a client-side navigation, because a layout-level
// <details> survives the route change and would stay open over the new page.

export function NavMenu({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (ref.current) ref.current.open = false
  }, [pathname])

  return (
    <details ref={ref} className="nav-menu">
      <summary className="nav-menu-summary">Menu</summary>
      {children}
    </details>
  )
}
