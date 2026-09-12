import Image from 'next/image'

// Every figure on the site: next/image with explicit dimensions and sizes so
// the browser reserves the box before the file arrives (no layout shift) and
// requests a file no wider than it will paint. `alt` is required and must say
// what the screen shows; a test refuses `alt=""` here.
//
// `data-reveal` rises the figure the first time it scrolls into view
// (src/components/reveal.tsx). With reduced motion on, or with JavaScript
// off, the figure is simply visible.

export interface FigureProps {
  src: string
  alt: string
  width: number
  height: number
  caption?: string
  /** A short name for the surface shown, set as a label strip above the image. */
  title?: string
  sizes?: string
  preload?: boolean
}

export function Figure({ src, alt, width, height, caption, title, sizes = '(max-width: 48rem) 100vw, 720px', preload }: FigureProps) {
  return (
    <figure className="wide" data-reveal>
      {title && <p className="label figure-title m-0">{title}</p>}
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
