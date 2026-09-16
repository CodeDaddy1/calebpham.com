# Security

What protects calebpham.com, where each piece lives, and how to check it.
The site is static: no accounts, no forms, no server code, no database. Most
of what an attacker could do to an application does not apply here; what is
left is the browser, the supply chain, the account settings and the domain.

## The measures

| Measure | Where | Verify |
| --- | --- | --- |
| Six response headers on every path: Content-Security-Policy, HSTS with includeSubDomains, Permissions-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy | `src/lib/security/headers.ts`, wired in `next.config.ts` | `npx tsx scripts/audit-headers.ts --url=https://calebpham.com` |
| The policy cannot drift: the production CSP is pinned verbatim, the development additions are pinned, and src/ is walked for any off-origin resource | `src/lib/security/headers.test.ts` (runs in `prebuild`, so a red test stops the Vercel build) | `npm test` |
| CI: type-check, lint, test, build; gitleaks over the full history; `npm audit --omit=dev --audit-level=high`, which blocks | `.github/workflows/ci.yml`, SHA-pinned actions, `permissions: contents: read` | The PR checks |
| Dependabot: weekly grouped minor and patch bumps, majors one at a time, never a major of next or react | `.github/dependabot.yml` | The Monday PR |
| Scanner paths denied at the edge: wp-admin, .php, .sql, phpmyadmin and the rest of LumaIQ's list | Vercel firewall custom rule, generated from `src/lib/security/probe-paths.ts` | `npx vercel@latest firewall overview` |
| Disclosure: how to report a problem | `public/.well-known/security.txt`, `SECURITY.md` | `curl -sI https://calebpham.com/.well-known/security.txt` |
| Nothing at build or run time reads a secret | `.env.example`; the Vercel project holds no variables | `npx vercel@latest env ls` |

## The rules

**Any off-origin resource means editing `headers.ts` and its test first.** The
policy names this origin and nothing else. A font, image, script or fetch from
another host is refused by every browser and raises no build error; the test's
source walk fails with the file and the URL, which is the reminder.

**npm audit: the count IS the check.** Today it is zero. Anything above zero is
news: fix it with `npm audit fix` (never `--force`, which downgrades), or
accept it here with a dated note and the reason. The CI job blocks at high.

**security.txt: renew Expires yearly.** RFC 9116 requires a date under a year
out. The test refuses a lapsed or too-distant date and says what to edit.

**The firewall is the ledger.** LumaIQ records probes in a database and mails a
weekly digest. Here the equivalent is `npx vercel@latest firewall overview`
(the last day, by action and rule) and `npx vercel@latest firewall rules list
--expand`. Vercel's own mitigation already denies the common WordPress paths
before the app sees them; the custom rule covers the rest.

## What is deliberately not here

- No nonce-based CSP. Static pages are built without a request, so no nonce
  can be minted; `script-src 'self' 'unsafe-inline'` is what Next's own guide
  recommends for this case. On a site with no user input, inline injection
  has no way in, and every external script is still pinned to this origin.
- No HSTS preload, no COOP, COEP or CORP. Same stance as LumaIQ: preload is
  one-way, and the other three have no payoff on a static site.
- No Sentry, rate limits or cron digest: nothing to attach them to.
- Preview deployments get the production policy, so Vercel's preview toolbar
  (`vercel.live`) is blocked there. Previews are SSO-protected and unused.
