import type { MDXComponents } from 'mdx/types'
import type { Route } from 'next'
import Link from 'next/link'
import type { ComponentProps, ReactElement } from 'react'
import { CodeBlock, isCodeLang } from '@/components/code-block'
import { CodeQuote } from '@/components/code-quote'
import { Figure } from '@/components/figure'
import { Paired } from '@/components/paired'

// Required by @next/mdx on the App Router: without this file the build fails,
// and with it every MDX file on the site renders through these mappings.
// Element styling lives in globals.css under `.prose`; only behaviour is
// mapped here.

// Internal links go through next/link (prefetch, typed routes, hence the
// `as Route` cast on a value the type checker cannot see as a literal);
// external links stay plain anchors.
function Anchor({ href = '', ...rest }: ComponentProps<'a'>) {
  if (href.startsWith('/')) return <Link href={href as Route} {...rest} />
  return <a href={href} rel="noopener" {...rest} />
}

// MDX renders a fenced block as <pre><code className="language-ts">…</code></pre>.
// The language and the text are lifted off that inner element and handed to
// the server-side highlighter; an unknown language renders as plain mono.
function Pre({ children }: ComponentProps<'pre'>) {
  const child = children as ReactElement<{ className?: string; children?: unknown }> | undefined
  const props = child && typeof child === 'object' && 'props' in child ? child.props : undefined
  const lang = props?.className?.replace(/^language-/, '') ?? 'text'
  const code = typeof props?.children === 'string' ? props.children : ''
  return <CodeBlock code={code} lang={isCodeLang(lang) ? lang : 'text'} />
}

const components = {
  a: Anchor,
  pre: Pre,
  CodeQuote,
  Figure,
  Paired,
} satisfies MDXComponents

export function useMDXComponents(): MDXComponents {
  return components
}
