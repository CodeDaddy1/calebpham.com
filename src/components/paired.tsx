import type { ReactNode } from 'react'

// A code excerpt beside the demo screen it drives. In MDX:
//
//   <Paired>
//   <CodeQuote …>…</CodeQuote>
//   <Figure … caption="the surface this code serves" />
//   </Paired>
//
// Two columns from 64rem up (the code takes three fifths, the screen sticks
// while the code scrolls), stacked below. src/content/content.test.ts holds
// each Paired to exactly one excerpt then one figure with a caption that
// names the surface.

export function Paired({ children }: { children: ReactNode }) {
  return <div className="pair">{children}</div>
}
// The frame, the label bar and the entrance order (screen first, code 100ms
// after) are CSS in globals.css under `.pair`.
