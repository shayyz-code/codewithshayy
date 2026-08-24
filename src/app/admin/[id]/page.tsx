import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAdminProject } from "@/data/projects/admin"
import { updateProjectAction } from "../actions"
import ProjectForm from "@/ui/admin/project-form"
import { firstParam } from "@/ui/admin/field-error"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Edit project — Admin",
  robots: { index: false, follow: false },
}

export default async function PageAdminEdit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  // Both the image actions and updateProjectAction redirect back here with
  // ?error=… when they fail. They have no other way to report: the forms are
  // server components, and a throw renders the error boundary with the message
  // stripped. `field=form` says which of the two it was — this page renders an
  // image form and a text form, and a message under the wrong one reads as a
  // different thing having failed.
  searchParams: Promise<{ error?: string | string[]; field?: string | string[] }>
}) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const project = await getAdminProject(id)
  if (!project) notFound()

  const error = firstParam(query.error)
  const isForm = firstParam(query.field) === "form"

  return (
    <main className="min-h-screen">
      <ProjectForm
        project={project}
        action={updateProjectAction.bind(null, id)}
        heading={`Edit: ${project.title}`}
        mediaError={isForm ? null : error}
        formError={isForm ? error : null}
      />
    </main>
  )
}
