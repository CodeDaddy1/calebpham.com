import type { ReactNode } from 'react'

// The three labelled paragraphs that follow every excerpt (Decision,
// Measurement, What breaks if wrong), as a strip: one column on a phone,
// three from 64rem, each label set as a tracked heading above its text.
// src/content/content.test.ts still reads the three bold labels in order.

export function Notes({ children }: { children: ReactNode }) {
  return <div className="notes">{children}</div>
}
