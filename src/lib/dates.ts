const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** '2026-04' becomes 'April 2026'. */
export function monthYear(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

/** '2026-04' to null becomes 'April 2026 to present'. */
export function period(start: string, end: string | null): string {
  const from = monthYear(start)
  if (end === null) return `${from} to present`
  if (end === start) return from
  return `${from} to ${monthYear(end)}`
}

const SHORT = MONTHS.map((m) => m.slice(0, 3))

/** '2026-04' becomes 'Apr 2026': the resume's date rail is three letters wide. */
export function monthYearShort(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return `${SHORT[m - 1]} ${y}`
}
