// resume.ts is the data; the PDF is a rendering of it. Edit the data, the
// document, or the print styles without running `npm run resume:pdf`, and this
// turns the suite red, and therefore the Vercel build, via prebuild.
//
// WHAT BREAKS IF THIS IS WRONG: a recruiter downloads a resume that says
// something the page no longer says, and nobody notices for months.

import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { resumeStamp } from './resume-stamp'
import stamp from './resume.stamp.json'

const ROOT = new URL('../../', import.meta.url).pathname
const PDF = `${ROOT}public/Caleb-Pham-Resume.pdf`

describe('the committed resume PDF', () => {
  it('was generated from the current data, document, and print styles', () => {
    expect(stamp.sha256, 'run `npm run build && npm run resume:pdf` and commit the PDF and stamp').toBe(resumeStamp())
  })

  it('exists and is a PDF', () => {
    expect(existsSync(PDF)).toBe(true)
    expect(readFileSync(PDF).subarray(0, 4).toString()).toBe('%PDF')
  })

  it('is exactly one Letter page', () => {
    // Chromium's PDF writer emits one uncompressed `/Type /Page` object per
    // page and a `/Count N` on the page tree. Both are read, so a change in
    // how the tree is written cannot let a two-page file pass by accident.
    const pdf = readFileSync(PDF, 'latin1')
    const pages = pdf.match(/\/Type\s*\/Page(?![A-Za-z])/g) ?? []
    const tree = pdf.match(/<<[^>]*\/Type\s*\/Pages\b[^>]*>>/)?.[0] ?? ''
    const count = Number(tree.match(/\/Count\s+(\d+)/)?.[1])
    expect(pages.length, 'the resume ran past one Letter page; tighten the print block or the copy').toBe(1)
    expect(count).toBe(1)
    expect(pdf, 'not Letter: check @page and preferCSSPageSize').toContain('/MediaBox [0 0 612 792]')
  })
})
