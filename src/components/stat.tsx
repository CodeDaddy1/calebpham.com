import type { Stat as StatData } from '@/lib/home'

// A stat tile. The server renders the final figure; reveal.tsx counts the
// visible span up from zero when the tile scrolls into view (1400ms, ease out
// quart, thousands separators). That span is aria-hidden and a visually
// hidden sibling carries the final figure, so a screen reader never hears a
// partial number and no JavaScript shows the truth.

const fmt = (n: number) => n.toLocaleString('en-US')

export function Stat({ stat }: { stat: StatData }) {
  const { label, value, range, prefix = '', suffix = '' } = stat
  const spoken = range ? `${fmt(range[0])} to ${fmt(range[1])}${suffix}` : `${prefix}${fmt(value ?? 0)}${suffix}`
  return (
    <div className="stat" data-reveal>
      <p className="label m-0">{label}</p>
      <p className="stat-value m-0">
        <span aria-hidden="true">
          {range ? (
            <>
              <span data-count={range[0]}>{fmt(range[0])}</span>
              {' to '}
              <span data-count={range[1]} data-suffix={suffix}>
                {fmt(range[1])}
                {suffix}
              </span>
            </>
          ) : (
            <span data-count={value} data-prefix={prefix} data-suffix={suffix}>
              {prefix}
              {fmt(value ?? 0)}
              {suffix}
            </span>
          )}
        </span>
        <span className="sr-only">{spoken}</span>
      </p>
    </div>
  )
}
