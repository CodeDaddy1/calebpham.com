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
})
