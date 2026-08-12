import { eq } from "drizzle-orm"
import { getDb } from "./db"
import { settings } from "./schema"

// Site content, read at request time like projects. Mirrors
// src/data/projects/index.ts.

/** The single settings row. */
export const SETTINGS_ID = "site"

export type SiteSettings = {
  heroEyebrow: string | null
  /** Newline-separated; each line is its own black-backed block. */
  heroHeading: string | null
  heroBodyMd: string | null
  heroCtaLabel: string | null
  heroCtaHref: string | null
  developerTitle: string | null
  developerName: string | null
  developerBadge: string | null
  bioMd: string | null
  contactEmail: string | null
  contactPhone: string | null
  contactLocation: string | null
  developerMediaKey: string | null
  backgroundMediaKey: string | null
}

/**
 * What the site said before any of it was editable.
 *
 * Used only when the settings row is missing entirely — a fresh database, or a
 * wiped table — so the site degrades to its previous self rather than to blanks
 * or a 500.
 */
const DEFAULTS: SiteSettings = {
  heroEyebrow: "Mingalabar",
  heroHeading: "Stop Scrolling.\nStart Coding.",
  heroBodyMd:
    "**Code w/ Shayy** is where I make coding tutorials and hacks *on a whim*. I skip the fluff and focus on real-world tips.",
  heroCtaLabel: "Visit GitHub",
  heroCtaHref: "https://github.com/shayyz-code",
  developerTitle: "Software Engineer",
  developerName: "Aung Min Khant aka. Shayy",
  developerBadge: "Shayy",
  bioMd:
    "Heyy, I'm Shayy, a *Rusty* Software Engineer. I've been coding since I was 12, and now I build industry projects and contribute to open source, when I can.",
  contactEmail: "aungminkhant.shay@gmail.com",
  // What the page says today. Removing the phone and address is a decision for
  // the author, not a side effect of making them editable — clearing either in
  // the admin now takes it off the page for good.
  contactPhone: "+959765072801",
  contactLocation: "York street, Dagon Township, Yangon, Myanmar",
  developerMediaKey: null,
  backgroundMediaKey: null,
}

/**
 * Returns the settings row, or the built-in defaults when there is no row.
 *
 * **The fallback is row-level, never per-column.** If a row exists it is
 * authoritative and a NULL column means empty. Falling back column by column
 * would make a cleared field indistinguishable from an unset one — blanking the
 * phone number would put the old one straight back on the page, which is the
 * one thing this table exists to allow.
 */
export async function getSettings(): Promise<SiteSettings> {
  const db = await getDb()
  const row = await db.query.settings.findFirst({
    where: eq(settings.id, SETTINGS_ID),
  })

  if (!row) return DEFAULTS

  return {
    heroEyebrow: row.heroEyebrow,
    heroHeading: row.heroHeading,
    heroBodyMd: row.heroBodyMd,
    heroCtaLabel: row.heroCtaLabel,
    heroCtaHref: row.heroCtaHref,
    developerTitle: row.developerTitle,
    developerName: row.developerName,
    developerBadge: row.developerBadge,
    bioMd: row.bioMd,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    contactLocation: row.contactLocation,
    developerMediaKey: row.developerMediaKey,
    backgroundMediaKey: row.backgroundMediaKey,
  }
}
