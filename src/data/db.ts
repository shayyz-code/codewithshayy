import { getCloudflareContext } from "@opennextjs/cloudflare"
import { drizzle } from "drizzle-orm/d1"
import * as schema from "./schema"

/**
 * Drizzle client bound to the D1 binding for the current request.
 *
 * `async: true` is required in statically-generated routes. Note that during
 * static generation this resolves to *local* dev bindings, so any route reading
 * the database must be dynamic — see the `dynamic` export in the project routes.
 */
export async function getDb() {
  const { env } = await getCloudflareContext({ async: true })
  return drizzle(env.DB, { schema })
}
