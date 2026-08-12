import { and, eq, ne } from "drizzle-orm"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb } from "../db"
import { projects } from "../schema"

// R2 writes for the admin. Reads happen in src/app/media/[...key]/route.ts.

/**
 * Extensions the media route knows how to serve.
 *
 * SVG is deliberately absent. It is the only image format that executes script,
 * and /media serves it untransformed, so an uploaded SVG would run on the apex
 * origin. Nothing in the bucket is an SVG, so excluding it costs nothing.
 *
 * Note this keys on `file.type`, which the browser supplies and a client can
 * lie about. That is why the media route sends `nosniff` and a sandbox CSP —
 * this allowlist narrows the damage rather than preventing a mislabel.
 */
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
}

// Cloudflare Images caps what it will transform, and a portfolio image has no
// business being larger than this. The GIF already in the bucket is 1 MB.
const MAX_BYTES = 5 * 1024 * 1024

/**
 * Uploads an image and returns its R2 key.
 *
 * The key embeds a hash of the content because /media serves objects with
 * `immutable, max-age=31536000`. Reusing a key for new bytes would leave the
 * old image cached at the edge and in browsers for a year. Identical bytes
 * therefore also dedupe to the same key.
 */
export async function putMedia(file: File, slug: string): Promise<string> {
  const ext = ALLOWED[file.type]
  if (!ext) {
    throw new Error(
      `unsupported image type: ${file.type || "unknown"} — use png, jpeg, webp, avif or gif`,
    )
  }
  if (file.size === 0) throw new Error("file is empty")
  if (file.size > MAX_BYTES) {
    throw new Error(
      `image is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 5 MB`,
    )
  }

  const bytes = await file.arrayBuffer()
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  const hash = Array.from(new Uint8Array(digest).slice(0, 4))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  const key = `projects/${slug}-${hash}.${ext}`
  const { env } = getCloudflareContext()

  // httpMetadata is not optional. An object stored without it is served with no
  // Content-Type at all, which is how the media route broke when these were
  // first uploaded by hand without --content-type.
  await env.MEDIA.put(key, bytes, {
    httpMetadata: { contentType: file.type },
  })

  return key
}

/**
 * Deletes an object, but only when no other project still points at it.
 * Content-addressed keys mean two projects with the same image share a key, so
 * an unconditional delete would break the other one.
 */
export async function deleteMediaIfUnreferenced(
  key: string,
  exceptProjectId: string,
) {
  const db = await getDb()
  const others = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.mediaKey, key), ne(projects.id, exceptProjectId)))
    .limit(1)

  if (others.length > 0) return

  const { env } = getCloudflareContext()
  await env.MEDIA.delete(key)
}
