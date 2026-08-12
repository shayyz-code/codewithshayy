import { getPost } from "@/data/posts"
import { json, notFound, toApiPost } from "../../shared"

// See the note in ../route.ts.
export const dynamic = "force-dynamic"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const post = getPost(slug)

  // getPost reads listPosts, so drafts are absent rather than 404-with-a-hint.
  if (!post) return notFound(`post "${slug}"`)

  return json({ data: toApiPost(post) })
}
