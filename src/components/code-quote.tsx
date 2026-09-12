import type { ReactNode } from 'react'

// A quoted excerpt from a real repository: the file and the line range, and,
// when a case study chooses to give one, a link that pins the exact commit.
// No link is the normal case (the site links to no code host); the excerpt
// is the proof. The fenced block inside it is rendered by mdx-components'
// `pre` mapping, so this component only draws the header.
//
// src/content/content.test.ts enforces the shape: 20 to 40 lines inside, the
// three labelled paragraphs after, and any href commit-pinned.

export interface CodeQuoteProps {
  file: string
  lines: string
  href?: string
  children: ReactNode
}

export function CodeQuote({ file, lines, href, children }: CodeQuoteProps) {
  return (
    <figure className="wide my-8 code-quote" data-reveal>
      <figcaption className="code-quote-bar">
        <span className="label code-quote-file">{file}</span>
        <span className="label">lines {lines}</span>
        {href && (
          <a href={href} rel="noopener" className="text-accent underline underline-offset-4">
            view at this commit
          </a>
        )}
      </figcaption>
      {children}
    </figure>
  )
}
