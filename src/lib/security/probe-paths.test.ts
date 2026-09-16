// The firewall rule must catch a scanner and never a visitor.
//
// The positives are LumaIQ's own fixtures, seen in its production ledger.
// The negatives are everything this site actually serves: the sitemap
// routes and each with a trailing segment, every file under public/ as a
// URL path, and the platform paths Next answers on its own. The rule is
// also held to RE2: Vercel's firewall does not run JavaScript regex, so a
// lookaround that passes here would be rejected or, worse, ignored there.
//
// WHAT BREAKS IF THIS IS WRONG: a real page or file answers 403 to every
// visitor, quietly, or a scanner path answers 200 and the rule is decoration.

import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import sitemap from '@/app/sitemap'
import { SITE_URL } from '@/lib/site'
import { PROBE_RULE, isProbePath } from './probe-paths'

const PUBLIC = fileURLToPath(new URL('../../../public', import.meta.url))

function files(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) files(full, out)
    else out.push(`/${relative(PUBLIC, full)}`)
  }
  return out
}

describe('catches what LumaIQ has seen scanners ask for', () => {
  it.each([
    '/wp-admin/install.php',
    '/wp-login.php',
    '/xmlrpc.php',
    '/wordpress/wp-admin/setup-config.php',
    '/.env',
    '/.env.production',
    '/.git/config',
    '/.aws/credentials',
    '/api/.env',
    '/phpmyadmin/index.php',
    '/actuator/health',
    '/manager/html',
    '/vendor/phpunit/phpunit/src/Util/PHP/eval-stdin.php',
    '/_ignition/execute-solution',
    '/cgi-bin/luci',
    '/index.php',
    '/login.aspx',
    '/etc/passwd/../../secret',
    '/files/%2e%2e/%2e%2e/etc/passwd',
    '/backup.sql',
    '/site.tar.gz',
  ])('%s', (path) => {
    expect(isProbePath(path)).toBe(true)
  })
})

describe('leaves every real path alone', () => {
  const routes = sitemap().map((e) => e.url.replace(SITE_URL, '') || '/')

  it('walks the sitemap', () => {
    expect(routes.length).toBeGreaterThanOrEqual(7)
    expect(routes).toContain('/')
  })

  it.each(routes)('%s, and %s/anything', (route) => {
    expect(isProbePath(route)).toBe(false)
    expect(isProbePath(`${route.replace(/\/$/, '')}/anything`)).toBe(false)
  })

  it('every file under public/', () => {
    const served = files(PUBLIC)
    expect(served.length).toBeGreaterThan(30)
    expect(served.filter(isProbePath)).toEqual([])
  })

  it.each([
    '/sitemap.xml',
    '/robots.txt',
    '/favicon.ico',
    '/icon.svg',
    '/apple-icon.png',
    '/opengraph-image',
    '/opengraph-image-abc123',
    '/work/lumaiq/opengraph-image',
    '/_next/static/chunks/a.js',
    '/_next/image?url=%2Fteam%2Fcaleb-pham.jpg',
    '/_vercel/insights/script.js',
    '/notes',
    '/.well-known/security.txt',
    '/.well-known',
    '/pmanager',
    '/shellfish-report',
    '/solrise',
    '/work/the-ninth-room',
  ])('%s', (path) => {
    expect(isProbePath(path)).toBe(false)
  })
})

describe('the rule is RE2-safe and firewall-shaped', () => {
  it('uses no lookaround or backreference in any expression', () => {
    for (const group of PROBE_RULE.groups) {
      for (const c of group) {
        if (c.op !== 're') continue
        expect(c.value, c.value).not.toMatch(/\(\?[=!<]/)
        expect(c.value, c.value).not.toMatch(/\\[1-9]/)
        expect(() => new RegExp(c.value)).not.toThrow()
      }
    }
  })

  it('names the source file in its description and keeps every condition on the path', () => {
    expect(PROBE_RULE.description).toContain('src/lib/security/probe-paths.ts')
    for (const group of PROBE_RULE.groups) for (const c of group) expect(c.type).toBe('path')
    expect(PROBE_RULE.groups).toHaveLength(4)
  })
})
