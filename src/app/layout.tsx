import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { archivo, geistMono } from './fonts'
import { SITE, SITE_URL } from '@/lib/site'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import './globals.css'

export const metadata: Metadata = {
  // Without metadataBase, Next resolves relative OG image paths against
  // localhost and every social card silently points at a machine nobody can
  // reach. It is also what makes the generated opengraph-image routes absolute.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name}, ${SITE.title}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: { type: 'website', siteName: SITE.name, locale: 'en_US', url: SITE_URL },
  twitter: { card: 'summary_large_image' },
}

// The site is dark-only. colorScheme tells the browser so form controls and
// scrollbars match; themeColor is the --background token; viewportFit lets the
// fixed header and rail pad into the phone's safe areas. globals.dark-only.test.ts
// pins the first two.
export const viewport: Viewport = {
  themeColor: '#0B0B0B',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${geistMono.variable}`}
    >
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
