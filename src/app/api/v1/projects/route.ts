import { listProjects } from "@/data/projects"
import { json, toApiProject } from "../shared"

// Reads D1, so the same rule as every other data route applies:
// getCloudflareContext resolves to *local* bindings during static generation,
// and a prerendered listing would serve whatever the build machine's database
// held at deploy time.
export const dynamic = "force-dynamic"

export async function GET() {
  const projects = await listProjects()

  // listProjects filters to published, so unpublished work cannot leak here any
  // more than it can from /projects.
  return json({ data: projects.map((p) => toApiProject(p, { body: false })) })
}
