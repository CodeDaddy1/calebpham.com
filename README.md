# calebpham.com

Personal site of Caleb Pham, founder and software engineer, proptech.

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 strict, Tailwind CSS 4,
MDX for prose, typed TypeScript modules for data. Every route is static. Deployed on
Vercel; pushes to `main` are production.

## Run

```bash
npm ci
npm run dev          # http://localhost:3000
npm run check        # typecheck, lint, build (the build runs the test suite first)
npm test             # the suite on its own
npm run resume:pdf   # regenerate public/Caleb-Pham-Resume.pdf from /resume (needs a build)
npm run icons        # regenerate favicon.ico and apple-icon.png from src/app/icon.svg
```

## Gates

The suite enforces the design system rather than documenting it: every text
colour token clears WCAG AA on both surfaces it can land on, no raw Tailwind
palette class exists, every CSS variable named in source is declared, the site
is light-only, the sitemap matches the routes on disk, prose follows the house
diction, and the committed resume PDF matches the resume data.

## Licence

Code is MIT (`LICENSE`). Content is all rights reserved (`LICENSE-CONTENT.md`).
