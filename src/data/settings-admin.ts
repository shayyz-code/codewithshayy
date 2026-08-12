import { eq } from "drizzle-orm"
import { sql } from "drizzle-orm"
import { getDb } from "./db"
import { settings } from "./schema"
import { DEFAULTS, SETTINGS_ID, type SiteSettings } from "./settings"

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

/**
 * Writes one media column without touching the rest.
 *
 * The insert branch seeds every other column from DEFAULTS, and that is not
 * decoration. getSettings falls back row-level, so a row is authoritative the
 * moment it exists — creating one with a single column would blank the hero,
 * bio, name band and contact block. Uploading an image before ever saving the
 * form is exactly that case, and it is a plausible first action in a fresh
 * admin.
 */
export async function setSettingsMediaKey(
  field: "developerMediaKey" | "backgroundMediaKey",
  key: string | null,
) {
  const db = await getDb()
  await db
    .insert(settings)
    .values({ ...DEFAULTS, id: SETTINGS_ID, [field]: key, updatedAt: NOW })
    .onConflictDoUpdate({
      // Only the media column on conflict: an existing row already holds the
      // author's own copy and must not be reset to defaults.
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
