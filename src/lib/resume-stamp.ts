// The fingerprint of everything the resume PDF depends on.
//
// Concept: content hashing as a staleness check. The PDF is a rendering of
// four inputs; hash the inputs at generation time, and a test can tell you
// the rendering is stale without opening it. Git cannot tell the two apart.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const ROOT = new URL('../../', import.meta.url).pathname

/** The resume's own styling: its screen rules (which the printed page also
 *  uses for the facts strip and the rails) and the @media print block that
 *  follows them, together the tail of globals.css. */
function printBlock(): string {
  const css = readFileSync(`${ROOT}src/app/globals.css`, 'utf-8')
  const at = css.indexOf('/* Resume (src/components/resume/resume-document.tsx)')
  const fallback = css.indexOf('@media print')
  return css.slice(at >= 0 ? at : Math.max(fallback, 0))
}

export function resumeStamp(): string {
  return createHash('sha256')
    .update(readFileSync(`${ROOT}src/lib/resume.ts`, 'utf-8'))
    .update(readFileSync(`${ROOT}src/components/resume/resume-document.tsx`, 'utf-8'))
    // The face the PDF is set in. A font change reflows every line.
    .update(readFileSync(`${ROOT}src/app/fonts.ts`, 'utf-8'))
    .update(printBlock())
    .digest('hex')
}
