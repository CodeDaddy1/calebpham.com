import { Fragment } from 'react'

// Splits a heading into words, each in an overflow-hidden clip, so the
// [data-reveal-words] rule can lift them one by one. Server-rendered; the
// stagger is an inline animation-delay per word. Spaces stay outside the
// clips so a screen reader hears a sentence, not a list of words.

export function Words({ text, step = 45, base = 0 }: { text: string; step?: number; base?: number }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <Fragment key={i}>
          <span className="w">
            <span style={{ animationDelay: `${base + i * step}ms` }}>{word}</span>
          </span>{' '}
        </Fragment>
      ))}
    </>
  )
}
