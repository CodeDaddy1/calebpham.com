import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Not found' }

// The global 404 renders inside the root layout, so the header, with Book a
// demo, and the footer are already around it.
export default function NotFound() {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <div className="wrap">
        <p className="label">404</p>
        <h1 id="not-found-title">There is no page at this address.</h1>
        <Link href="/" className="btn">
          Back to the start
        </Link>
      </div>
    </section>
  )
}
