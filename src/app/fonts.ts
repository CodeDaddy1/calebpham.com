import { Geist, Geist_Mono } from 'next/font/google'

// LumaIQ's two faces, so the site and the screens on it read as one product.
//
// Text: one variable Geist file covering every weight the page uses (400 to
// 600), preloaded because the headline is the largest paint.
export const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
})

// Labels. One static weight, preloaded too: the hero's eyebrow is a label.
// adjustFontFallback is OFF: next/font's metric fallback for anything that is
// not category 'serif' is Arial (next/dist/server/font-utils.js), so a
// size-adjusted PROPORTIONAL face would stand in for mono during the swap.
export const geistMono = Geist_Mono({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-geist-mono',
  fallback: ['ui-monospace', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
})
