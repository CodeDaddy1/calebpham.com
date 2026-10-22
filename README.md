# calebpham.com

Caleb Pham's site: one page for storage owners and operators to meet him and see Verillum AI working.

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 strict, Tailwind CSS 4.
Every string lives in `src/lib/page.ts`. Every route is static. Deployed on Vercel;
pushes to `main` are production.

## Run

```bash
npm ci
npm run dev          # http://localhost:3000
npm run check        # typecheck, lint, build (the build runs the test suite first)
npm test             # the suite on its own
npm run icons        # regenerate favicon.ico and apple-icon.png from src/app/icon.svg
node scripts/encode-screens.mjs <capture dir>   # app captures into public/screens and src/lib/screens.json
```

## Gates

The suite enforces the design system rather than documenting it: every text
colour token clears WCAG AA on both surfaces it can land on, no raw Tailwind
palette class exists, every CSS variable named in source is declared, the site
is light-only, the sitemap matches the routes on disk, prose follows the house
diction and its length limits, retired facts stay retired, and the security
headers match their pinned policy (`docs/security.md`).

## Licence

Code is MIT (`LICENSE`). Content is all rights reserved (`LICENSE-CONTENT.md`).
