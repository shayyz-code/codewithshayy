import type { Metadata } from "next"
import { listAllProjects } from "@/data/projects/admin"
import AdminList from "@/ui/Admin/AdminList"

// Reads D1, so it must be dynamic for the same reason the public routes are.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Projects — Admin",
  robots: { index: false, follow: false },
}

export default async function PageAdmin() {
  return (
    <main className="min-h-screen">
      <AdminList projects={await listAllProjects()} />
    </main>
  )
}
