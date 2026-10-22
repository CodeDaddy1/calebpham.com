import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { geist, geistMono } from './fonts'
import { SITE, SITE_URL } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  // Without metadataBase, Next resolves relative OG image paths against
  // localhost and every social card silently points at a machine nobody can
  // reach. It is also what makes the generated opengraph-image route absolute.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name}, ${SITE.title}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: { type: 'website', siteName: SITE.name, locale: 'en_US', url: SITE_URL },
  twitter: { card: 'summary_large_image' },
}

// The site is light-only. colorScheme tells the browser so form controls and
// scrollbars match; themeColor is the header's white, the colour the phone's
// chrome meets; viewportFit lets the sticky header pad into the safe areas.
// globals.light-only.test.ts pins the first two.
export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// One page and the 404, both inside the same chrome: the sticky header with
// Book a demo, the page, the footer.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  )
}
