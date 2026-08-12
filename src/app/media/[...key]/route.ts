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
}

// Cloudflare Images rejects animated GIFs above its size limit — the 1 MB,
// 190-frame rangoon-academy GIF comes back 403 "Blocked" — so GIF streams
// through untouched.
//
// SVG is no longer served as an image at all: uploads reject it, and the serve
// list below forces any lingering .svg object to octet-stream, which nosniff
// stops a browser from rendering.
const NO_TRANSFORM = new Set(["gif"])

// The only content types this route will hand back as-is. Everything else is
// downgraded to application/octet-stream regardless of what R2 has stored.
const SERVEABLE = new Set(Object.values(CONTENT_TYPES))

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

  // The stored content type is not authoritative. writeHttpMetadata replays
  // whatever was recorded at upload, and that came from the browser's
  // `file.type` — a client can claim anything, and objects put by hand carry
  // whatever --content-type was passed. Anything outside the serve list becomes
  // an octet-stream, so a stored `image/svg+xml` or `text/html` cannot be used
  // to get script executing on this origin.
  const declared = headers.get("content-type")?.split(";")[0].trim() ?? ""
  if (!SERVEABLE.has(declared)) {
    headers.set("content-type", CONTENT_TYPES[ext] ?? "application/octet-stream")
  }

  // This route is excluded from the middleware matcher, so it gets none of the
  // headers set there and has to set its own.
  //
  // Both matter here more than anywhere else. writeHttpMetadata replays the
  // content type recorded at upload, which came from the browser's `file.type`
  // — client-controlled. nosniff stops a mislabelled or octet-stream object
  // being sniffed into something executable, and the sandbox policy neuters any
  // markup that does slip through.
  headers.set("x-content-type-options", "nosniff")
  headers.set("content-security-policy", "default-src 'none'; sandbox")

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
