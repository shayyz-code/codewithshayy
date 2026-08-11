import { getCloudflareContext } from "@opennextjs/cloudflare"

// Streams objects out of the R2 bucket, resizing through the IMAGES binding
// when a width is requested.
//
// Optimization happens here rather than via /_next/image on purpose. The
// default optimizer fetches the source URL, and with global_fetch_strictly_public
// that self-fetch leaves the worker and fails ("upstream response is invalid").
// Transforming inline skips the round trip entirely.
//
// Object keys are effectively immutable — a changed image gets a new key — so
// responses cache hard.
const CACHE_CONTROL = "public, max-age=31536000, immutable"

// Fallback only: objects uploaded with --content-type carry their own. Without
// this an object stored with no httpMetadata is served with no Content-Type.
const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
}

// Cloudflare Images rejects animated GIFs above its size limit — the 1 MB,
// 190-frame rangoon-academy GIF comes back 403 "Blocked" — and SVG is not a
// raster format. Both are served through untouched.
const NO_TRANSFORM = new Set(["gif", "svg"])

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: segments } = await params
  const key = segments.join("/")

  const { env } = await getCloudflareContext({ async: true })
  const object = await env.MEDIA.get(key)

  if (!object) {
    return new Response("Not found", { status: 404 })
  }

  const ext = key.split(".").pop()?.toLowerCase() ?? ""
  const width = Number(new URL(request.url).searchParams.get("w")) || undefined

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set("etag", object.httpEtag)
  headers.set("cache-control", CACHE_CONTROL)
  if (!headers.has("content-type")) {
    headers.set("content-type", CONTENT_TYPES[ext] ?? "application/octet-stream")
  }

  if (!width || NO_TRANSFORM.has(ext) || !env.IMAGES) {
    return new Response(object.body, { headers })
  }

  try {
    const result = await env.IMAGES.input(object.body)
      .transform({ width })
      .output({ format: "image/webp" })

    const out = new Headers(headers)
    out.set("content-type", "image/webp")
    out.delete("content-length") // transformed body is a different size
    return new Response(result.image(), { headers: out })
  } catch {
    // Anything Images refuses still gets served, just unresized.
    const fallback = await env.MEDIA.get(key)
    return fallback
      ? new Response(fallback.body, { headers })
      : new Response("Not found", { status: 404 })
  }
}
