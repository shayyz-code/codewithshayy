import { defineCloudflareConfig } from "@opennextjs/cloudflare"

// Incremental cache is left on the default for now. Once the R2 bucket exists,
// this is where r2IncrementalCache gets wired in.
export default defineCloudflareConfig()
