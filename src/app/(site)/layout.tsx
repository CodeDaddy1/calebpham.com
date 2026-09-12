import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

// Every page but the home: solid fixed header, the page, the footer. The
// header is fixed, so main pads down by its height (globals.css .site-main).
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="site-main flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
