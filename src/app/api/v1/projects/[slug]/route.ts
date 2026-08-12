import { getProject } from "@/data/projects"
import { json, notFound, toApiProject } from "../../shared"

// Reads D1 — see the note in ../route.ts.
export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const project = await getProject(slug)

  // getProject filters to published, so a draft is indistinguishable from a
  // slug that does not exist. That is deliberate: a 404 here and a 200 there
  // would let anyone enumerate unpublished work.
  if (!project) return notFound(`project "${slug}"`)

  return json({ data: toApiProject(project, { body: true }) })
}
