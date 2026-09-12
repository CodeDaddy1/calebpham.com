import { SiteHeader } from '@/components/site-header'

// The home page's chrome: a transparent header over the stage and no footer,
// because the Contact chapter is the footer.
export default function HomeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader overVideo />
      <main id="main">{children}</main>
    </>
  )
}
