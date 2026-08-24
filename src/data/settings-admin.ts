import { eq } from "drizzle-orm"
import { sql } from "drizzle-orm"
import { getDb } from "./db"
import { settings } from "./schema"
import { DEFAULTS, SETTINGS_ID, type SiteSettingsText } from "./settings"

// Write side for site settings, kept apart from settings.ts so the read path
// stays obviously read-only — the same split as projects/index.ts and
// projects/admin.ts.

const NOW = sql`strftime('%Y-%m-%dT%H:%M:%SZ', 'now')`

/**
 * Writes the text columns of the settings row, creating it on first save.
 *
 * An upsert rather than an update, because the row does not exist until
 * something is saved — until then the site runs on the defaults in settings.ts.
 * The first save is therefore also the moment the defaults stop applying, which
 * is what makes a cleared field stay cleared.
 *
 * **The insert branch spreads DEFAULTS first.** getSettings falls back
 * row-level, so a row is authoritative the moment it exists; creating one with
 * only the columns this form posts would blank the two media keys. Spreading
 * DEFAULTS supplies them as null, which is what they are before an upload — and
 * if an upload did come first, the row already exists and this takes the
 * conflict branch instead.
 *
 * **The conflict branch sets only `input`.** The two media columns are absent
 * from it deliberately: `setSettingsMediaKey` owns them, and a text save must
 * not touch what it does not own.
 */
export async function saveSettings(input: SiteSettingsText) {
  const db = await getDb()
  await db
    .insert(settings)
    .values({ ...DEFAULTS, id: SETTINGS_ID, ...input, updatedAt: NOW })
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
