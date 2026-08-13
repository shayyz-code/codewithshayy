import type { Metadata } from "next"
import { getSettings } from "@/data/settings"
import { getSettingsRow } from "@/data/settings-admin"
import SettingsForm from "@/ui/admin/settings-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Site settings — Admin",
  robots: { index: false, follow: false },
}

export default async function PageAdminSettings({
  searchParams,
}: {
  // The image actions redirect back here with ?error=… and the field it came
  // from, since there are two image forms and a message under the wrong one
  // reads as a different upload having failed.
  searchParams: Promise<{ error?: string; field?: string }>
}) {
  // `row` is null until the first save; `effective` is what the site currently
  // renders. Showing the effective values as placeholders makes it obvious what
  // a blank field will fall back to, and that saving pins them.
  const [row, effective, { error, field }] = await Promise.all([
    getSettingsRow(),
    getSettings(),
    searchParams,
  ])

  return (
    <main className="min-h-screen">
      <SettingsForm
        row={row}
        effective={effective}
        error={error ?? null}
        errorField={field ?? null}
      />
    </main>
  )
}
