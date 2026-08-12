import { relations, sql } from "drizzle-orm"
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core"

// Source of truth for the D1 schema. `pnpm db:generate` turns this into SQL
// under migrations/; never hand-edit the generated files.
//
// Three columns are deliberately nullable because the real data needs them to
// be, and the UI renders conditionally rather than emitting dead links or empty
// image boxes:
//
//   siteUrl   not every project has a live site
//   repoUrl   two repos are private, one does not exist, and a private repo
//             404s for visitors. Only public, resolving repos get a value.
//             Replaces a hardcoded github.com/shayyz-code/<slug> template that
//             produced broken links for 3 of 6 projects.
//   mediaKey  dreamyfancies-pvs has no image at all
//
// mediaKey holds an R2 object key, not an absolute URL, so the storage host
// stops leaking into rows the way the old firebasestorage photo_url did.

const timestamp = () => sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    siteUrl: text("site_url"),
    repoUrl: text("repo_url"),
    mediaKey: text("media_key"),
    // The long-form write-up, rendered as markdown on the detail page. Prose
    // rather than structured fields, because that is what a project write-up
    // is; `role` and `year` are columns because they are the two facts uniform
    // enough across projects to be worth querying. All nullable, so the detail
    // page has to render without them.
    bodyMd: text("body_md"),
    role: text("role"),
    year: text("year"),
    position: integer("position").notNull().default(0),
    published: integer("published", { mode: "boolean" })
      .notNull()
      .default(true),
    createdAt: text("created_at").notNull().default(timestamp()),
    updatedAt: text("updated_at").notNull().default(timestamp()),
  },
  (t) => [index("idx_projects_published_position").on(t.published, t.position)],
)

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
})

export const projectTags = sqliteTable(
  "project_tags",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.tagId] }),
    // Reverse lookup, so tag -> projects does not table-scan.
    index("idx_project_tags_tag").on(t.tagId),
  ],
)

export const projectsRelations = relations(projects, ({ many }) => ({
  projectTags: many(projectTags),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  projectTags: many(projectTags),
}))

export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, {
    fields: [projectTags.projectId],
    references: [projects.id],
  }),
  tag: one(tags, {
    fields: [projectTags.tagId],
    references: [tags.id],
  }),
}))

// Site content that used to be hardcoded in components: the hero copy, the bio,
// the contact block, and the two photographs.
//
// One row, fixed id. A settings table with many rows would need a "which one is
// live" concept that nothing here wants.
//
// Every content column is nullable, and that is load-bearing rather than lazy:
// NULL means *empty*, so clearing the phone number removes it from the page.
// The built-in defaults apply only when the whole row is missing — see
// src/data/settings.ts. Per-column fallback would make a cleared field
// indistinguishable from an unset one, and put the old value straight back.
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),

  heroEyebrow: text("hero_eyebrow"),
  /** Newline-separated; each line renders as its own black-backed block. */
  heroHeading: text("hero_heading"),
  heroBodyMd: text("hero_body_md"),
  heroCtaLabel: text("hero_cta_label"),
  heroCtaHref: text("hero_cta_href"),

  /** The band over the background photo. */
  developerTitle: text("developer_title"),
  developerName: text("developer_name"),
  developerBadge: text("developer_badge"),

  bioMd: text("bio_md"),

  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  contactLocation: text("contact_location"),

  /** R2 object keys, same convention as projects.mediaKey. */
  developerMediaKey: text("developer_media_key"),
  backgroundMediaKey: text("background_media_key"),

  updatedAt: text("updated_at").notNull().default(timestamp()),
})
