import { Newsreader, Inter, Geist_Mono } from 'next/font/google'

// Display. One static instance at 500, the only display weight the site uses,
// preloaded. The variable file with the optical-size axis measured 129 KB in
// Phase 0, above the 90 KB the plan allows for a preloaded font; the static
// cut is a quarter of that and the 36 to 56px headings keep the text-size
// design of the face.
export const newsreader = Newsreader({
  weight: '500',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
})

// Display italic: one static instance, not preloaded. A second family as far
// as next/font is concerned; globals.css maps `em` inside display type to it.
// Asking one call for weight x style arrays would download four files and
// preload all four (next/font builds the cross product).
export const newsreaderItalic = Newsreader({
  weight: '400',
  style: 'italic',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  variable: '--font-newsreader-italic',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
})

// Body. Variable, one file, covers 400 / 500 / 600.
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
})

// Code. One static weight, lazy (below the fold, not on every page).
// adjustFontFallback is OFF: next/font's metric fallback for anything that is
// not category 'serif' is Arial (next/dist/server/font-utils.js), so a
// size-adjusted PROPORTIONAL face would stand in for code during the swap and
// every column would jump. A real monospace fallback keeps alignment.
export const geistMono = Geist_Mono({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  variable: '--font-geist-mono',
  fallback: ['ui-monospace', 'Menlo', 'Consolas', 'monospace'],
})
