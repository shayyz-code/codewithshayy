import type { Metadata } from "next"
import { createProjectAction } from "../actions"
import ProjectForm from "@/ui/admin/project-form"
import { firstParam } from "@/ui/admin/field-error"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "New project — Admin",
  robots: { index: false, follow: false },
}

export default async function PageAdminNew({
  searchParams,
}: {
  // createProjectAction redirects back here with ?error=… when parse rejects
  // a field. It has no other way to report: this is a server component, and a
  // throw renders the error boundary with the message stripped.
  searchParams: Promise<{ error?: string | string[] }>
}) {
  const query = await searchParams

  return (
    <main className="min-h-screen">
      <ProjectForm
        action={createProjectAction}
        heading="New project"
        formError={firstParam(query.error)}
      />
    </main>
  )
}
