"use client"

// Custom next/image loader.
//
// R2-backed media is resized by the /media route itself, via the IMAGES
// binding. Routing through /_next/image instead makes the optimizer fetch the
// URL back out of the worker, which global_fetch_strictly_public blocks.
//
// Everything else (files in public/) is returned untouched and served as-is.
export default function cloudflareLoader({
  src,
  width,
}: {
  src: string
  width: number
  quality?: number
}) {
  if (src.startsWith("/media/")) {
    return `${src}?w=${width}`
  }
  return src
}
