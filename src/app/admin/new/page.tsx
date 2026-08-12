import type { Metadata } from "next"
import { createProjectAction } from "../actions"
import ProjectForm from "@/ui/admin/project-form"

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
