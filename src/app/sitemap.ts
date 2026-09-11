import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'
import { publishedProjects } from '@/lib/projects'
import { publishedNotes } from '@/lib/notes'

// Every route on the site is public and static, so this is a plain list.
// sitemap.test.ts walks src/app for page.tsx files and fails if this list and
// the routes on disk ever disagree in either direction, which is how a page
// gets added without anyone remembering this file.

// A build-time constant rather than `new Date()` per request: the sitemap is
// static, so the date is the deploy date.
const BUILD_DATE = new Date()

type Entry = MetadataRoute.Sitemap[number]

const FIXED: [path: string, priority: number][] = [
  ['/', 1],
  ['/work', 0.8],
]

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed: Entry[] = FIXED.map(([path, priority]) => ({
    url: absoluteUrl(path),
    lastModified: BUILD_DATE,
    changeFrequency: 'monthly',
    priority,
  }))

  const work: Entry[] = publishedProjects().map((p) => ({
    url: absoluteUrl(`/work/${p.slug}`),
    lastModified: BUILD_DATE,
    changeFrequency: 'yearly',
    priority: 0.9,
  }))

  const notes: Entry[] = publishedNotes().map((n) => ({
    url: absoluteUrl(`/notes/${n.slug}`),
    lastModified: new Date(`${n.date}T12:00:00Z`),
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  return [...fixed, ...work, ...notes]
}
