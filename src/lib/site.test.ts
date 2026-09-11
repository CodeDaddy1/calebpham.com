import { describe, expect, it } from 'vitest'
import { SITE, SITE_URL, absoluteUrl } from './site'

describe('site url', () => {
  it('is the apex with no trailing slash when nothing overrides it', () => {
    // Under vitest neither NEXT_PUBLIC_SITE_URL nor VERCEL_PROJECT_PRODUCTION_URL
    // is set, so this is the fallback branch.
    expect(SITE_URL).toBe('https://calebpham.com')
  })

  it('joins a path with exactly one slash', () => {
    expect(absoluteUrl('/about')).toBe('https://calebpham.com/about')
    expect(absoluteUrl('about')).toBe('https://calebpham.com/about')
  })

  it('carries the identity the whole site reads', () => {
    expect(SITE.email).toBe('caleb@lumaiq.dev')
    expect(SITE.linkedin).toMatch(/^https:\/\/www\.linkedin\.com\/in\//)
    expect(SITE.title).toBe('Founder and Software Engineer, Proptech')
  })
})
