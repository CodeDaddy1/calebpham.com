import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'
import { PageBand } from '@/components/page-band'
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
        <PageBand label="404" title="Not found" lede="There is no page at this address." />
        <Container className="py-12">
          <p className="rise-in">
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
