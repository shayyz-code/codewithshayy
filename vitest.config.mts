import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

// Pure functions only — no jsdom, no component rendering, no route tests.
// `scripts/smoke.sh` is the integration suite and stays the one that boots a
// worker; anything needing a D1 or R2 binding belongs there, not here.
//
// The scope is deliberate rather than a starting point. What is worth pinning
// here is logic that has no other check: `mediaUrl` maps two different stored
// shapes and was once wrong in one of its two copies, and the admin form
// helpers are the site's only write boundary.
export default defineConfig({
  test: {
    include: ["src/**/__tests__/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
