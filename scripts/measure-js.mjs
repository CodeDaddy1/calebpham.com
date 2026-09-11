// The client JavaScript budget for `/`.
//
// Run after `npm run build`:  npm run measure:js
//
// Reads the prerendered home page, collects every script and stylesheet it
// loads, gzips each at level 9 and prints the totals. The framework floor
// (React 19 plus the Next 16 App Router runtime, before a line of site code)
// is recorded in scripts/js-budget.json once; after that the budget is the
// floor plus 12 KB of site code, and this exits 1 when it is exceeded.
//
// WHAT BREAKS IF THIS IS WRONG: a server component quietly becomes a client
// one (a stray 'use client', an import of shiki from a client file) and the
// page ships a hundred kilobytes it does not need, with the build still green.

import { readFileSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const root = process.cwd()
const html = readFileSync(join(root, '.next/server/app/index.html'), 'utf-8')

const scripts = [...html.matchAll(/<script[^>]+src="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1])
const styles = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1])

const gz = (path) => gzipSync(readFileSync(join(root, '.next', path.replace(/^\/_next\//, '')).split('?')[0]), { level: 9 }).length
const sum = (paths) => paths.reduce((n, p) => n + gz(p), 0)

for (const s of scripts) console.log(`${(gz(s) / 1024).toFixed(1).padStart(7)} KB  ${s}`)
const js = sum(scripts)
const css = sum(styles)
console.log(`\nJS  ${(js / 1024).toFixed(1)} KB gzipped across ${scripts.length} files`)
console.log(`CSS ${(css / 1024).toFixed(1)} KB gzipped across ${styles.length} files`)

const budgetFile = join(root, 'scripts/js-budget.json')
if (existsSync(budgetFile)) {
  const { floorBytes, allowanceBytes, cssMaxBytes } = JSON.parse(readFileSync(budgetFile, 'utf-8'))
  const max = floorBytes + allowanceBytes
  console.log(`Budget: floor ${(floorBytes / 1024).toFixed(1)} KB plus ${(allowanceBytes / 1024).toFixed(1)} KB = ${(max / 1024).toFixed(1)} KB; CSS max ${(cssMaxBytes / 1024).toFixed(1)} KB`)
  if (js > max || css > cssMaxBytes) {
    console.error('OVER BUDGET')
    process.exit(1)
  }
} else {
  console.log('No scripts/js-budget.json yet: record the floor from this run.')
}
