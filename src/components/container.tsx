import type { ReactNode } from 'react'

/** The one horizontal measure every section shares. */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1080px] px-5 sm:px-8 ${className}`}>{children}</div>
}
