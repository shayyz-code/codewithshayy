import { and, asc, desc, eq } from "drizzle-orm"
import { getDb } from "./db"
import { projects, projectTags, tags } from "./schema"

export type Project = {
  id: string
  slug: string
  title: string
  description: string
  /** null when the project has no live site — the Visit button is hidden. */
  siteUrl: string | null
  /** null for private or nonexistent repos — the GitHub link is hidden. */
  repoUrl: string | null
  /** R2 object key, null when there is no image — a placeholder renders. */
  mediaKey: string | null
  tags: string[]
}

type ProjectWithTags = typeof projects.$inferSelect & {
  projectTags: { tag: typeof tags.$inferSelect }[]
}

function toProject(row: ProjectWithTags): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    siteUrl: row.siteUrl,
    repoUrl: row.repoUrl,
    mediaKey: row.mediaKey,
    tags: row.projectTags.map((pt) => pt.tag.name),
  }
}

// The `with` clause is written inline at each call site rather than shared.
// Hoisting it into a const or helper widens the literal `true` to `boolean`,
// which Drizzle's relational types reject.

export async function listProjects(): Promise<Project[]> {
  const db = await getDb()

  const rows = await db.query.projects.findMany({
    where: eq(projects.published, true),
    orderBy: [asc(projects.position), desc(projects.createdAt)],
    with: {
      projectTags: {
        orderBy: [asc(projectTags.position)],
        with: { tag: true },
      },
    },
  })

  return rows.map(toProject)
}

export async function getProject(slug: string): Promise<Project | null> {
  const db = await getDb()

  const row = await db.query.projects.findFirst({
    where: and(eq(projects.slug, slug), eq(projects.published, true)),
    with: {
      projectTags: {
        orderBy: [asc(projectTags.position)],
        with: { tag: true },
      },
    },
  })

  return row ? toProject(row) : null
}
