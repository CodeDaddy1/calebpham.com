// Prints the Vercel CLI command that creates the probe-path firewall rule
// from src/lib/security/probe-paths.ts, so the rule on the account is the
// rule in the repo and never a hand-typed copy.
//
// Run:  npx tsx scripts/firewall-rule.ts [--action=log|deny]
//
// Default is log: the rule runs a day in the Firewall tab so any match on a
// real path is seen before anything is denied. Then edit it to deny:
//
//   npx vercel@latest firewall rules edit "Probe paths" --action deny --yes
//   npx vercel@latest firewall publish --yes
//
// The command is printed, not run: a firewall change is published on
// purpose, by hand, after reading the diff.

import { PROBE_RULE } from '../src/lib/security/probe-paths'

const action = process.argv.find((a) => a.startsWith('--action='))?.slice(9) ?? 'log'
if (action !== 'log' && action !== 'deny') {
  console.error(`--action must be log or deny, not ${action}`)
  process.exit(1)
}

const shell = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`

const parts = ['npx vercel@latest firewall rules add', shell(PROBE_RULE.name), `--description ${shell(PROBE_RULE.description)}`, `--action ${action}`]
PROBE_RULE.groups.forEach((group, i) => {
  if (i > 0) parts.push('--or')
  for (const c of group) parts.push(`--condition ${shell(JSON.stringify(c))}`)
})
parts.push('--yes')

console.log(parts.join(' \\\n  '))
console.log('\nThen: npx vercel@latest firewall diff && npx vercel@latest firewall publish --yes')
