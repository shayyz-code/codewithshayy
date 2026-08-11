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
