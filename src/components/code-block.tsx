import 'server-only'
import { createHighlighter, createCssVariablesTheme } from 'shiki'

// Syntax highlighting at build time, on the server, with no client
// JavaScript. shiki's css-variables theme emits `color: var(--shiki-token-*)`
// inline, and those variables resolve to the six code inks in globals.css,
// which globals.contrast.test.ts measures like any other text token. A JSON
// theme would be a second, unmeasured palette.
//
// `import 'server-only'` makes it a build error to import this file from a
// client component; without it the highlighter and its grammars (over 100 KB
// gzipped) would ship to every visitor.

const LANGS = ['ts', 'tsx', 'python', 'sql', 'css', 'bash', 'json'] as const
export type CodeLang = (typeof LANGS)[number]

const theme = createCssVariablesTheme({ name: 'css-variables', variablePrefix: '--shiki-', fontStyle: true })

// One highlighter for the whole build. createHighlighter is async and loads
// the grammars once; a module-level promise means every code block on every
// page shares it.
const highlighter = createHighlighter({ themes: [theme], langs: [...LANGS] })

export function isCodeLang(value: string): value is CodeLang {
  return (LANGS as readonly string[]).includes(value)
}

export async function CodeBlock({ code, lang }: { code: string; lang: CodeLang | 'text' }) {
  if (lang === 'text') {
    return (
      <pre>
        <code>{code}</code>
      </pre>
    )
  }
  const h = await highlighter
  const html = h.codeToHtml(code.replace(/\n$/, ''), { lang, theme: 'css-variables' })
  return <div className="wide" dangerouslySetInnerHTML={{ __html: html }} />
}
