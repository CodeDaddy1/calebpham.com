import { Archivo, Geist_Mono } from 'next/font/google'

// Display and body: one variable Archivo file carrying the width axis (62 to
// 125), preloaded. The design sets headings narrow (font-stretch 80 to 88
// percent), so the axis is the point; `weight` is omitted because next/font
// refuses `weight` together with `axes` and a variable face covers 100 to
// 900 anyway. The latin file measured 90 KB on 2026-09-12; it replaces Inter
// (48 KB) and Newsreader (24 KB), both preloaded before. Google's @font-face
// for this request declares `font-stretch: 62% 125%`, which is what lets
// `font-stretch: 88%` in globals.css select the narrow instance.
export const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-archivo',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
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
