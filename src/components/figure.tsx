import Image from 'next/image'

// Every figure on the site: next/image with explicit dimensions and sizes so
// the browser reserves the box before the file arrives (no layout shift) and
// requests a file no wider than it will paint. `alt` is required and must say
// what the screen shows; a test refuses `alt=""` here.
//
// `data-reveal` is the single motion on the site: a 320ms rise the first time
// the figure scrolls into view, applied by reveal-observer.tsx. With reduced
// motion on, or with JavaScript off, the figure is simply visible.

export interface FigureProps {
  src: string
  alt: string
  width: number
  height: number
  caption?: string
  sizes?: string
  preload?: boolean
}

export function Figure({ src, alt, width, height, caption, sizes = '(max-width: 48rem) 100vw, 720px', preload }: FigureProps) {
  return (
    <figure className="wide" data-reveal>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={75}
        preload={preload}
        className="h-auto w-full rounded-md border border-line bg-card"
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
