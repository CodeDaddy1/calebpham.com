// The fingerprint of everything the resume PDF depends on.
//
// Concept: content hashing as a staleness check. The PDF is a rendering of
// three inputs; hash the inputs at generation time, and a test can tell you
// the rendering is stale without opening it. Git cannot tell the two apart.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const ROOT = new URL('../../', import.meta.url).pathname

/** The @media print block of globals.css, the only styling the PDF sees. */
function printBlock(): string {
  const css = readFileSync(`${ROOT}src/app/globals.css`, 'utf-8')
  const at = css.indexOf('@media print')
  return at >= 0 ? css.slice(at) : ''
}

export function resumeStamp(): string {
  return createHash('sha256')
    .update(readFileSync(`${ROOT}src/lib/resume.ts`, 'utf-8'))
    .update(readFileSync(`${ROOT}src/components/resume/resume-document.tsx`, 'utf-8'))
    .update(printBlock())
    .digest('hex')
}
