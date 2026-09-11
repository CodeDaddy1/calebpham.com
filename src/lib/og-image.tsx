import { ImageResponse } from 'next/og'

// Social cards, rendered by the Satori runtime behind `next/og`. Two
// constraints shape everything below: Satori supports only a subset of CSS
// (flexbox, no grid, every element needs an explicit display), and it cannot
// reach the network, so no web fonts and no remote images. The mark is drawn
// as divs. The runtime's bundled Geist Regular renders the text.

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

// Frozen copies of the tokens in globals.css. Composition space cannot read
// CSS variables, so these are literals, and globals.contrast.test.ts fails if
// they drift from the tokens. A card that does not look like the site is a
// small lie at the top of every share.
const INK = '#1C1A17'
const MUTED = '#5E5850'
const ACCENT = '#9F4716'
const PAGE = '#F6F1E8'
const CARD = '#FFFDF9'
const BORDER = 'rgba(28, 26, 23, 0.10)'

/** The mark: two rust bars forming a corner, the same shape as icon.svg. */
function Mark() {
  return (
    <div style={{ display: 'flex', position: 'relative', width: 56, height: 56 }}>
      <div style={{ display: 'flex', position: 'absolute', left: 6, top: 6, width: 44, height: 12, borderRadius: 2, background: ACCENT }} />
      <div style={{ display: 'flex', position: 'absolute', left: 6, top: 6, width: 12, height: 44, borderRadius: 2, background: ACCENT }} />
    </div>
  )
}

export interface OgCard {
  /** Small tracked-out label above the title. */
  eyebrow?: string
  title: string
  /** One supporting line. Anything long is unreadable at card size. */
  subtitle?: string
  /** Small facts along the bottom. */
  tags?: string[]
}

export function ogImage(card: OgCard): ImageResponse {
  // Long titles have to shrink or they overflow; Satori will not reflow them.
  const titleSize = card.title.length > 78 ? 54 : card.title.length > 46 ? 64 : 76

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: PAGE,
          padding: '72px 80px',
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Mark />
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: INK, letterSpacing: '-0.02em' }}>
            Caleb Pham
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {card.eyebrow && (
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                fontWeight: 600,
                color: ACCENT,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 18,
              }}
            >
              {card.eyebrow}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              fontSize: titleSize,
              fontWeight: 700,
              color: INK,
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              maxWidth: 1000,
            }}
          >
            {card.title}
          </div>
          {card.subtitle && (
            <div style={{ display: 'flex', marginTop: 22, fontSize: 28, color: MUTED, lineHeight: 1.4, maxWidth: 900 }}>
              {card.subtitle}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {(card.tags ?? []).map((tag) => (
              <div
                key={tag}
                style={{
                  display: 'flex',
                  padding: '8px 18px',
                  borderRadius: 999,
                  border: `1px solid ${BORDER}`,
                  background: CARD,
                  fontSize: 22,
                  color: MUTED,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: MUTED }}>calebpham.com</div>
        </div>
      </div>
    ),
    OG_SIZE,
  )
}
