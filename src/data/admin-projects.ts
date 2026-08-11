import { asc, eq, inArray, sql } from "drizzle-orm"
import { getDb } from "./db"
import { projects, projectTags, tags } from "./schema"
import type { Project } from "./projects"

// Write side, kept separate from projects.ts so the read path stays obviously
// read-only. Everything here is called from server actions under /admin.

/** Admin view of a project: adds the fields the public type deliberately omits. */
export type AdminProject = Project & {
  position: number
  published: boolean
}

export type ProjectInput = {
  slug: string
  title: string
  description: string
  siteUrl: string | null
  repoUrl: string | null
  bodyMd: string | null
  role: string | null
  year: string | null
  published: boolean
  /** Tag names; created on demand and rewired wholesale on save. */
  tags: string[]
}

type Row = typeof projects.$inferSelect & {
  projectTags: { tag: typeof tags.$inferSelect }[]
}

function toAdminProject(row: Row): AdminProject {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    siteUrl: row.siteUrl,
    repoUrl: row.repoUrl,
    mediaKey: row.mediaKey,
    bodyMd: row.bodyMd,
    role: row.role,
    year: row.year,
    tags: row.projectTags.map((pt) => pt.tag.name),
    position: row.position,
    published: row.published,
  }
}

/** Every project, published or not, in the order the public list uses. */
export async function listAllProjects(): Promise<AdminProject[]> {
  const db = await getDb()
  const rows = await db.query.projects.findMany({
    orderBy: [asc(projects.position), asc(projects.createdAt)],
    with: {
      projectTags: {
        orderBy: [asc(projectTags.position)],
        with: { tag: true },
      },
    },
  })
  return rows.map(toAdminProject)
}

export async function getAdminProject(id: string): Promise<AdminProject | null> {
  const db = await getDb()
  const row = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      projectTags: {
        orderBy: [asc(projectTags.position)],
        with: { tag: true },
      },
    },
  })
  return row ? toAdminProject(row) : null
}

/**
 * Replaces a project's tags. Tag rows are shared, so this creates any that are
 * new, rewires project_tags, and leaves orphaned tags in place — they are
 * harmless and may be reused.
 */
async function setTags(
  db: Awaited<ReturnType<typeof getDb>>,
  projectId: string,
  names: string[],
) {
  await db.delete(projectTags).where(eq(projectTags.projectId, projectId))
  if (names.length === 0) return

  // onConflictDoNothing so an existing tag is left alone rather than erroring.
  await db
    .insert(tags)
    .values(names.map((name) => ({ name })))
    .onConflictDoNothing()

  const rows = await db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .where(inArray(tags.name, names))

  const idOf = new Map(rows.map((r) => [r.name, r.id]))
  const links = names
    .map((name, position) => ({ name, position }))
    .filter((n) => idOf.has(n.name))
    .map((n) => ({
      projectId,
      tagId: idOf.get(n.name)!,
      position: n.position,
    }))

  if (links.length) await db.insert(projectTags).values(links)
}

export async function createProject(input: ProjectInput): Promise<string> {
  const db = await getDb()
  const id = crypto.randomUUID()

  // New projects go last. max(position) rather than count, so a delete does not
  // cause two projects to share a position.
  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${projects.position}), -1) + 1` })
    .from(projects)

  await db.insert(projects).values({
    id,
    slug: input.slug,
    title: input.title,
    description: input.description,
    siteUrl: input.siteUrl,
    repoUrl: input.repoUrl,
    bodyMd: input.bodyMd,
    role: input.role,
    year: input.year,
    published: input.published,
    position: next,
  })

  await setTags(db, id, input.tags)
  return id
}

export async function updateProject(id: string, input: ProjectInput) {
  const db = await getDb()
  await db
    .update(projects)
    .set({
      slug: input.slug,
      title: input.title,
      description: input.description,
      siteUrl: input.siteUrl,
      repoUrl: input.repoUrl,
      bodyMd: input.bodyMd,
      role: input.role,
      year: input.year,
      published: input.published,
      updatedAt: sql`strftime('%Y-%m-%dT%H:%M:%SZ', 'now')`,
    })
    .where(eq(projects.id, id))

  await setTags(db, id, input.tags)
}

export async function deleteProject(id: string) {
  const db = await getDb()
  // project_tags cascades on the FK.
  await db.delete(projects).where(eq(projects.id, id))
}

export async function setPublished(id: string, published: boolean) {
  const db = await getDb()
  await db
    .update(projects)
    .set({
      published,
      updatedAt: sql`strftime('%Y-%m-%dT%H:%M:%SZ', 'now')`,
    })
    .where(eq(projects.id, id))
}

export async function setMediaKey(id: string, mediaKey: string | null) {
  const db = await getDb()
  await db
    .update(projects)
    .set({
      mediaKey,
      updatedAt: sql`strftime('%Y-%m-%dT%H:%M:%SZ', 'now')`,
    })
    .where(eq(projects.id, id))
}

/**
 * Moves a project one place up or down by swapping positions with its
 * neighbour. Positions are rewritten from the sorted order first, because
 * historical rows could share a position — two rows with the same value make a
 * swap a no-op.
 */
export async function moveProject(id: string, direction: "up" | "down") {
  const db = await getDb()
  const rows = await db
    .select({ id: projects.id })
    .from(projects)
    .orderBy(asc(projects.position), asc(projects.createdAt))

  const index = rows.findIndex((r) => r.id === id)
  if (index === -1) return

  const target = direction === "up" ? index - 1 : index + 1
  if (target < 0 || target >= rows.length) return

  const order = rows.map((r) => r.id)
  ;[order[index], order[target]] = [order[target], order[index]]

  // D1 has no multi-statement transactions in this driver; batch is the closest
  // equivalent, sending them as one unit. The cast is only to satisfy Drizzle's
  // non-empty tuple signature — `order` is non-empty by the time we get here.
  const statements = order.map((rowId, position) =>
    db.update(projects).set({ position }).where(eq(projects.id, rowId)),
  )
  type Statement = (typeof statements)[number]
  await db.batch(statements as unknown as [Statement, ...Statement[]])
}
