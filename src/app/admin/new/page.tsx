import type { Metadata } from "next"
import { createProjectAction } from "../actions"
import ProjectForm from "@/ui/Admin/ProjectForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "New project — Admin",
  robots: { index: false, follow: false },
}

export default function PageAdminNew() {
  return (
    <main className="min-h-screen">
      <ProjectForm action={createProjectAction} heading="New project" />
    </main>
  )
}
