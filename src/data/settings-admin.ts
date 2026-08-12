import { eq } from "drizzle-orm"
import { sql } from "drizzle-orm"
import { getDb } from "./db"
import { settings } from "./schema"
import { SETTINGS_ID, type SiteSettings } from "./settings"

// Write side for site settings, kept apart from settings.ts so the read path
// stays obviously read-only — the same split as projects/index.ts and
// projects/admin.ts.

const NOW = sql`strftime('%Y-%m-%dT%H:%M:%SZ', 'now')`

/**
 * Writes the whole settings row, creating it on first save.
 *
 * An upsert rather than an update, because the row does not exist until
 * something is saved — until then the site runs on the defaults in settings.ts.
 * The first save is therefore also the moment the defaults stop applying, which
 * is what makes a cleared field stay cleared.
 */
export async function saveSettings(input: SiteSettings) {
  const db = await getDb()
  await db
    .insert(settings)
    .values({ id: SETTINGS_ID, ...input, updatedAt: NOW })
    .onConflictDoUpdate({
      target: settings.id,
      set: { ...input, updatedAt: NOW },
    })
}

/** Used by the image upload, which writes one column without touching the rest. */
export async function setSettingsMediaKey(
  field: "developerMediaKey" | "backgroundMediaKey",
  key: string | null,
) {
  const db = await getDb()
  // The row may not exist yet if images are set before anything else is saved.
  await db
    .insert(settings)
    .values({ id: SETTINGS_ID, [field]: key, updatedAt: NOW })
    .onConflictDoUpdate({
      target: settings.id,
      set: { [field]: key, updatedAt: NOW },
    })
}

/** Reads the row for the admin form. Null when nothing has been saved yet. */
export async function getSettingsRow() {
  const db = await getDb()
  return (
    (await db.query.settings.findFirst({ where: eq(settings.id, SETTINGS_ID) })) ??
    null
  )
}
