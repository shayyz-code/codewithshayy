import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache"

// Prerendered pages (currently /blog/[slug]) live in .open-next/cache, not in
// the assets directory, so the worker needs an incremental cache to find them.
// Without one, every SSG route 404s with `Internal: NoFallbackError`.
//
// Static assets rather than R2 or KV: blog content is files in the repo, so it
// only ever changes on deploy. There is nothing to revalidate at runtime, and
// this needs no extra binding — it reads through the ASSETS binding already in
// wrangler.jsonc. Swap to r2IncrementalCache if on-demand revalidation is ever
// wanted.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
})
