import { defineConfig } from "drizzle-kit"

// Only generates SQL into migrations/. Applying it is wrangler's job
// (`pnpm db:migrate` / `db:migrate:remote`), so drizzle-kit never needs
// Cloudflare credentials.
export default defineConfig({
  dialect: "sqlite",
  driver: "d1-http",
  schema: "./src/data/schema.ts",
  out: "./migrations",
})
