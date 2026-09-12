import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export const metadata: Metadata = { title: 'Not found' }

// The global 404 renders inside the root layout only, so it draws the site
// chrome itself.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="site-main flex-1">
        <Container className="py-24">
          <p className="label">404</p>
          <h1 className="mt-3">Not found</h1>
          <p className="mt-4 max-w-[52ch] text-muted-strong">There is no page at this address.</p>
          <p className="mt-6">
            <Link href="/" className="pill pill-secondary">
              Back to the start
            </Link>
          </p>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
