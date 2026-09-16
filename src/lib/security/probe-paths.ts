// The paths a scanner asks for and a visitor never does, as one firewall rule.
//
// LumaIQ answers these with a bare 404 from its proxy and records them in a
// ledger. This site has no server, so the same list becomes a Vercel
// firewall rule that denies at the edge, before any function runs. The rule
// is generated from here by scripts/firewall-rule.ts, never typed by hand,
// and probe-paths.test.ts proves no real route, file or metadata path
// matches. THE FALSE-POSITIVE BAR IS ABSOLUTE: a signature that matches a
// real path is a silent 403 for everyone.
//
// Path only, by design: headers and query strings are attacker-controlled
// free text. Signatures are LumaIQ's (src/lib/security/probe-detection.ts),
// merged into four OR groups, and written for RE2: no lookaround, no
// backreferences, so the negation is a separate condition, not a `(?!`.

export interface Condition {
  type: 'path'
  /** `re` is an RE2 regular expression against the path; `pre` is a prefix. */
  op: 're' | 'pre'
  value: string
  /** Negate: the condition holds when the path does NOT match. */
  neg?: boolean
}

/** Segment-exact prefixes: WordPress, admin panels, known RCE endpoints. */
const PREFIXES = [
  'wp-admin', 'wp-login\\.php', 'wp-content', 'wp-includes', 'wp-json', 'wordpress', 'xmlrpc\\.php',
  'phpmyadmin', 'pma', 'adminer', 'adminer\\.php', 'cpanel', 'webmail', 'actuator', 'jenkins', 'solr',
  'manager/html', 'owa', 'autodiscover', 'druid', 'geoserver',
  'vendor/phpunit', '_ignition/execute-solution', 'cgi-bin', 'HNAP1', 'boaform', 'GponForm', '_profiler',
  'telescope/requests', 'api/jsonws', 'shell',
]

/** Server-side scripts this site cannot run, and backup archives it does not keep. */
const EXTENSIONS = 'php[0-9]?|phtml|asp|aspx|jsp|jspx|cgi|pl|sql|sqlite3?|bak|backup|old|rar|7z|tar|tar\\.gz|tgz'

export const PROBE_RULE = {
  name: 'Probe paths',
  description: 'Scanner paths a visitor never asks for: WordPress, admin panels, server-side scripts, backups, dot files, traversal. Generated from src/lib/security/probe-paths.ts.',
  /** OR of AND groups, the firewall's own shape. */
  groups: [
    [{ type: 'path', op: 're', value: `^/(${PREFIXES.join('|')})(/|$)` }],
    [{ type: 'path', op: 're', value: `\\.(${EXTENSIONS})$` }],
    // A dot segment anywhere (/.env, /.git/config, /api/.env) except the one
    // dot directory the web standardises on.
    [
      { type: 'path', op: 're', value: '/\\.[^/]' },
      { type: 'path', op: 'pre', value: '/.well-known', neg: true },
    ],
    [{ type: 'path', op: 're', value: '(\\.\\./|\\.\\.%2f|%2e%2e)' }],
  ] as Condition[][],
}

function holds(c: Condition, pathname: string): boolean {
  const matched = c.op === 're' ? new RegExp(c.value).test(pathname) : pathname.startsWith(c.value)
  return c.neg ? !matched : matched
}

/** What the firewall would decide for a path: true when any group's conditions all hold. */
export function isProbePath(pathname: string): boolean {
  return PROBE_RULE.groups.some((group) => group.every((c) => holds(c, pathname)))
}
