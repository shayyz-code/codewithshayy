import Image from "next/image"
import Link from "next/link"
import type { SiteSettings } from "@/data/settings"
import {
  removeSettingsImageAction,
  saveSettingsAction,
  uploadSettingsImageAction,
} from "@/app/admin/actions"
import FieldError from "@/ui/admin/field-error"

type Row = {
  developerMediaKey: string | null
  backgroundMediaKey: string | null
} & Partial<SiteSettings>

/**
 * A server component: the form posts straight to a server action, so there is
 * no client state here.
 *
 * `row` is null until the first save. `effective` is what the site renders
 * right now — the built-in defaults in that case — and is shown as placeholder
 * text so a blank field visibly means "using the default" rather than "empty".
 * Saving writes every field, which is the point at which defaults stop applying
 * and a cleared field stays cleared.
 */
export default function SettingsForm({
  row,
  effective,
  error = null,
  errorField = null,
}: {
  row: Row | null
  effective: SiteSettings
  /** Why the last image action failed, from ?error. See failMedia. */
  error?: string | null
  /** Which of the two image forms it came from, so it appears under that one. */
  errorField?: string | null
}) {
  return (
    <section className="px-5 py-20 max-w-2xl mx-auto flex flex-col gap-6">
      <header className="flex items-center justify-between border-b-4 border-black dark:border-primary pb-4">
        <div>
          <h1 className="font-display text-2xl tracking-wider uppercase">
            Site settings
          </h1>
          <p className="font-body text-xs mt-1 opacity-70">
            {row
              ? "Saved values are live."
              : "Nothing saved yet — the site is running on its built-in defaults."}
          </p>
        </div>
        <Link href="/admin" className="text-sky-600 font-body text-sm">
          &lt; Projects
        </Link>
      </header>

      <ImageField
        field="developerMediaKey"
        label="Photo of you"
        mediaKey={row?.developerMediaKey ?? null}
        hint="Shown on the home page and /me. Nothing renders there until one is set."
        error={errorField === "developerMediaKey" ? error : null}
      />
      <ImageField
        field="backgroundMediaKey"
        label="Background"
        mediaKey={row?.backgroundMediaKey ?? null}
        hint="Sits behind the name band on both pages, which render flat without it."
        error={errorField === "backgroundMediaKey" ? error : null}
      />

      <form action={saveSettingsAction} className="flex flex-col gap-5">
        {/* The image columns are written by their own actions. Carrying them
            through as hidden fields stops a text save from wiping them. */}
        <input
          type="hidden"
          name="developerMediaKey"
          value={row?.developerMediaKey ?? ""}
        />
        <input
          type="hidden"
          name="backgroundMediaKey"
          value={row?.backgroundMediaKey ?? ""}
        />

        <Group title="Hero" />
        <Field name="heroEyebrow" label="Eyebrow" row={row} effective={effective} />
        <Area
          name="heroHeading"
          label="Heading"
          rows={2}
          row={row}
          effective={effective}
          hint="One line per row — each renders as its own black block."
        />
        <Area
          name="heroBodyMd"
          label="Body"
          rows={4}
          row={row}
          effective={effective}
          hint="Markdown. **bold** is the large blue run, *italic* the display face."
        />
        <div className="grid grid-cols-2 gap-5">
          <Field name="heroCtaLabel" label="Button label" row={row} effective={effective} />
          <Field name="heroCtaHref" label="Button link" row={row} effective={effective} />
        </div>

        <Group title="Name band" />
        <div className="grid grid-cols-2 gap-5">
          <Field name="developerTitle" label="Title" row={row} effective={effective} />
          <Field name="developerBadge" label="Badge" row={row} effective={effective} />
        </div>
        <Field name="developerName" label="Name" row={row} effective={effective} />

        <Group title="About" />
        <Area
          name="bioMd"
          label="Bio"
          rows={4}
          row={row}
          effective={effective}
          hint="Markdown. *italic* renders in Rust orange."
        />

        <Group title="Contact" />
        <p className="font-body text-xs opacity-70 -mt-3">
          Every line is optional. Clear one and it disappears from the page —
          leaving all three empty removes the panel.
        </p>
        <Field name="contactEmail" label="Email" row={row} effective={effective} />
        <div className="grid grid-cols-2 gap-5">
          <Field name="contactPhone" label="Phone" row={row} effective={effective} />
          <Field name="contactLocation" label="Location" row={row} effective={effective} />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="font-display tracking-wider px-6 py-2 bg-primary text-white border-4 border-black hover:bg-secondary transition-all ease-out"
          >
            Save
          </button>
          <Link href="/" className="text-sky-600 font-body text-sm">
            View the site &gt;
          </Link>
        </div>
      </form>
    </section>
  )
}

function Group({ title }: { title: string }) {
  return (
    <h2 className="font-display text-sm tracking-wider uppercase border-b-2 border-current pb-1 mt-4">
      {title}
    </h2>
  )
}

type FieldProps = {
  name: keyof SiteSettings
  label: string
  row: Row | null
  effective: SiteSettings
  hint?: string
}

const inputClass =
  "w-full border-4 border-black dark:border-primary bg-white dark:bg-black px-3 py-2 font-body"

function Field({ name, label, row, effective, hint }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-display text-sm tracking-wide">{label}</span>
      <input
        type="text"
        name={name}
        defaultValue={row ? ((row[name] as string | null) ?? "") : ""}
        placeholder={effective[name] ?? ""}
        className={inputClass}
      />
      {hint && <span className="text-xs font-body opacity-60">{hint}</span>}
    </label>
  )
}

function Area({ rows = 3, ...p }: FieldProps & { rows?: number }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-display text-sm tracking-wide">{p.label}</span>
      <textarea
        name={p.name}
        rows={rows}
        defaultValue={p.row ? ((p.row[p.name] as string | null) ?? "") : ""}
        placeholder={p.effective[p.name] ?? ""}
        className={`${inputClass} font-mono text-sm`}
      />
      {p.hint && <span className="text-xs font-body opacity-60">{p.hint}</span>}
    </label>
  )
}

/**
 * There is no file fallback for either of these, and this field used to claim
 * otherwise — it pointed at /developer.webp and /bg4.webp, neither of which is
 * in public/, so an unset image rendered as a broken one captioned
 * "/developer.webp (built in)". The site behaves the same way: with no key the
 * element does not render at all, which is what an empty field now says.
 */
function ImageField({
  field,
  label,
  mediaKey,
  hint,
  error,
}: {
  field: "developerMediaKey" | "backgroundMediaKey"
  label: string
  mediaKey: string | null
  hint: string
  error: string | null
}) {
  return (
    <div className="flex flex-col gap-2 border-4 border-black dark:border-primary p-4">
      <span className="font-display text-sm tracking-wide">{label}</span>

      <FieldError message={error} />

      <div className="flex items-start gap-4">
        {mediaKey && (
          <div className="border-4 border-black bg-white shrink-0">
            <Image
              src={`/media/${mediaKey}`}
              alt={label}
              width={160}
              height={160}
              unoptimized={mediaKey.toLowerCase().endsWith(".gif")}
              className="w-40 h-auto"
            />
          </div>
        )}
        <div className="flex flex-col gap-2 min-w-0">
          {mediaKey ? (
            <code className="text-xs font-mono break-all opacity-70">
              {mediaKey}
            </code>
          ) : (
            <p className="font-body text-sm opacity-70">No image set.</p>
          )}
          {mediaKey && (
            <form action={removeSettingsImageAction.bind(null, field)}>
              <button
                type="submit"
                className="font-body text-xs border-2 border-current px-2 py-1 hover:bg-red-600 hover:text-white transition-all ease-out"
              >
                Remove
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Its own form: a nested one is invalid HTML, and uploading should not
          require the text fields to be valid or discard unsaved edits. */}
      <form
        action={uploadSettingsImageAction.bind(null, field)}
        className="flex flex-wrap items-center gap-3 pt-2"
      >
        <input
          type="file"
          name="image"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          required
          className="font-body text-sm"
        />
        <button
          type="submit"
          className="font-body text-xs border-2 border-current px-3 py-1 hover:bg-primary hover:text-white transition-all ease-out"
        >
          {mediaKey ? "Replace" : "Upload"}
        </button>
      </form>

      <span className="text-xs font-body opacity-60">
        {hint} png, jpeg, webp, avif or gif · 5 MB max.
      </span>
    </div>
  )
}
