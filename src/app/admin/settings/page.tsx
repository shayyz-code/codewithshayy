import type { Metadata } from "next"
import { getSettings } from "@/data/settings"
import { getSettingsRow } from "@/data/settings-admin"
import SettingsForm from "@/ui/admin/settings-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Site settings — Admin",
  robots: { index: false, follow: false },
}

export default async function PageAdminSettings() {
  // `row` is null until the first save; `effective` is what the site currently
  // renders. Showing the effective values as placeholders makes it obvious what
  // a blank field will fall back to, and that saving pins them.
  const [row, effective] = await Promise.all([getSettingsRow(), getSettings()])

  return (
    <main className="min-h-screen">
      <SettingsForm row={row} effective={effective} />
    </main>
  )
}
