import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'

export const metadata: Metadata = { title: 'Not found' }

export default function NotFound() {
  return (
    <Container className="py-24">
      <p className="eyebrow">404</p>
      <h1 className="mt-3">Not found</h1>
      <p className="mt-4 max-w-[52ch] text-muted-strong">There is no page at this address.</p>
      <p className="mt-6">
        <Link href="/" className="pill pill-secondary">
          Back to the start
        </Link>
      </p>
    </Container>
  )
}
