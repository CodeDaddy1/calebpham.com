import type { MDXComponents } from 'mdx/types'
import type { Route } from 'next'
import Link from 'next/link'
import type { ComponentProps } from 'react'

// Required by @next/mdx on the App Router: without this file the build fails,
// and with it every MDX file on the site renders through these mappings.
// Element styling lives in globals.css under `.prose`; only behaviour is
// mapped here. Internal links go through next/link (prefetch, typed routes,
// hence the `as Route` cast on a value the type checker cannot see as a
// literal); external links stay plain anchors.

function Anchor({ href = '', ...rest }: ComponentProps<'a'>) {
  if (href.startsWith('/')) return <Link href={href as Route} {...rest} />
  return <a href={href} rel="noopener" {...rest} />
}

const components = {
  a: Anchor,
} satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
