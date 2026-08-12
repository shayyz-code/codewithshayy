import { listPosts } from "@/data/posts"
import { json, toApiPost } from "../shared"

// Posts come from a generated module, not D1, so this could be static today.
// It is dynamic anyway: src/data/posts.ts exists as the seam that lets posts
// move into the database later without the callers changing, and a route that
// is static by accident is the exact shape the force-dynamic invariant exists
// to prevent. The cost of being wrong in this direction is one module read.
export const dynamic = "force-dynamic"

export async function GET() {
  // listPosts excludes drafts.
  return json({ data: listPosts().map(toApiPost) })
}
