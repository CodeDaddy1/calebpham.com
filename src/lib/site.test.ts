import { describe, expect, it } from 'vitest'
import { SITE, SITE_URL, absoluteUrl, resolveSiteUrl } from './site'

// The resolver is tested with explicit inputs, never with the ambient
// environment. The first version of this file asserted SITE_URL was the apex,
// which is true on a laptop and false inside a Vercel build, where
// VERCEL_PROJECT_PRODUCTION_URL is set. That red test blocked the first
// deploy, which is the gate working, but the test was wrong, not the code.

describe('resolveSiteUrl', () => {
  it('falls back to the apex with nothing set', () => {
    expect(resolveSiteUrl({})).toBe('https://calebpham.com')
  })

  it('prefers an explicit NEXT_PUBLIC_SITE_URL and strips a trailing slash', () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://preview.example/', VERCEL_PROJECT_PRODUCTION_URL: 'x.vercel.app' })).toBe(
      'https://preview.example',
    )
  })

  it('uses the Vercel production host when nothing explicit is set', () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'calebpham-com.vercel.app' })).toBe('https://calebpham-com.vercel.app')
  })

  it('treats blank values as unset', () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: '  ', VERCEL_PROJECT_PRODUCTION_URL: '' })).toBe('https://calebpham.com')
  })
})

describe('absoluteUrl', () => {
  it('joins a path with exactly one slash, whatever the host is', () => {
    expect(absoluteUrl('/about')).toBe(`${SITE_URL}/about`)
    expect(absoluteUrl('about')).toBe(`${SITE_URL}/about`)
    expect(SITE_URL.endsWith('/')).toBe(false)
  })
})

describe('identity', () => {
  it('carries the values the whole site reads', () => {
    expect(SITE.email).toBe('caleb@lumaiq.dev')
    expect(SITE.linkedin).toMatch(/^https:\/\/www\.linkedin\.com\/in\//)
    expect(SITE.title).toBe('Founder and Software Engineer, Proptech')
  })
})
