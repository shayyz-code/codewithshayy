---
paths:
  - "src/app/media/**"
  - "src/lib/image-loader.ts"
  - "src/data/projects/media.ts"
---

## Images

The default `next/image` optimizer does not run on Workers. Two paths replace it:

- **R2 media** is resized inside `src/app/media/[...key]/route.ts` via the
  `IMAGES` binding, and `src/lib/image-loader.ts` points `next/image` at
  `/media/<key>?w=N`. Optimizing through `/_next/image` does not work here —
  the optimizer fetches the source URL, and `global_fetch_strictly_public`
  sends that self-fetch out to the public internet, where it fails with
  `"url" parameter is valid but upstream response is invalid`.
- **Files in `public/`** pass through the loader untouched, so they are served
  at their committed size. Keep them small; a 4 MB PNG here is 4 MB on the
  wire. They are webp at sane dimensions for that reason.

Cloudflare Images returns **403 `Blocked`** for `rangoon-academy.gif` — 1 MB and
190 frames, so it cannot be flattened without losing the animation. GIF and SVG
skip the transform and stream through unchanged.

Admin uploads go through `src/data/projects/media.ts`. The key embeds a hash of
the content — `projects/<slug>-<hash8>.<ext>` — because `/media` serves objects
as `immutable, max-age=31536000`. Reusing a key for new bytes would leave the
old image cached for a year. Replacing deletes the previous object, but only
when no other row still points at it, since identical bytes dedupe to one key.

`GET /media/<key>?w=N` **500s under `next dev`** with `DevalueError: Cannot
stringify arbitrary non-POJOs` at `writeHttpMetadata`. That is the miniflare R2
shim, not the route — the same request is fine under `pnpm preview` and in
production. Do not chase it.

When uploading to R2 by hand, always pass `--content-type`. Without it R2 stores no
`httpMetadata`, `writeHttpMetadata()` emits nothing, and the object is served
with no `Content-Type` at all.
