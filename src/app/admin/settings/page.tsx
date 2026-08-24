import type { Metadata } from "next"
import { getSettings } from "@/data/settings"
import { getSettingsRow } from "@/data/settings-admin"
import SettingsForm from "@/ui/admin/settings-form"
import { firstParam } from "@/ui/admin/field-error"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Site settings — Admin",
  robots: { index: false, follow: false },
}

export default async function PageAdminSettings({
  searchParams,
}: {
  // The image actions and saveSettingsAction all redirect back here with
  // ?error=… and the field it came from — one of the two image forms, or
  // "form" for the text form's own validation. A message under the wrong one
  // reads as a different thing having failed.
  searchParams: Promise<{ error?: string | string[]; field?: string | string[] }>
}) {
  // `row` is null until the first save; `effective` is what the site currently
  // renders. Showing the effective values as placeholders makes it obvious what
  // a blank field will fall back to, and that saving pins them.
  const [row, effective, query] = await Promise.all([
    getSettingsRow(),
    getSettings(),
    searchParams,
  ])

  return (
    <main className="min-h-screen">
      <SettingsForm
        row={row}
        effective={effective}
        error={firstParam(query.error)}
        errorField={firstParam(query.field)}
      />
    </main>
  )
}
