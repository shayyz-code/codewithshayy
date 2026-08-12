import Link from "next/link"
import type { AdminProject } from "@/data/projects/admin"
import BodyEditor from "./BodyEditor"
import MediaField from "./MediaField"

// Shared by /admin/new and /admin/[id]. A server component: the form posts
// straight to a server action, so there is no client state to manage and no
// controlled inputs to keep in sync.
export default function ProjectForm({
  project,
  action,
  heading,
}: {
  project?: AdminProject
  action: (form: FormData) => void | Promise<void>
  heading: string
}) {
  return (
    <section className="px-5 py-20 max-w-2xl mx-auto flex flex-col gap-6">
      <header className="flex items-center justify-between border-b-4 border-black dark:border-primary pb-4">
        <h1 className="font-burbankblack text-2xl tracking-wider uppercase">
          {heading}
        </h1>
        <Link href="/admin" className="text-sky-600 font-burbankmedium text-sm">
          &lt; Cancel
        </Link>
      </header>

      <form action={action} className="flex flex-col gap-5">
        <Field name="title" label="Title" defaultValue={project?.title} required />
        <Field
          name="slug"
          label="Slug"
          defaultValue={project?.slug}
          required
          hint="lowercase letters, digits and hyphens — this is the URL"
        />
        <Area
          name="description"
          label="Description"
          defaultValue={project?.description}
          rows={3}
          required
          hint="one or two sentences, shown on the card"
        />

        <div className="grid grid-cols-2 gap-5">
          <Field name="role" label="Role" defaultValue={project?.role ?? ""} hint="e.g. Lead Developer" />
          <Field name="year" label="Year" defaultValue={project?.year ?? ""} hint="e.g. 2025" />
        </div>

        {/* Both links are optional and both are rendered conditionally on the
            public side. Leaving one blank hides it rather than producing a
            dead link, which is the whole reason these columns are nullable. */}
        <Field
          name="siteUrl"
          label="Site URL"
          defaultValue={project?.siteUrl ?? ""}
          hint="leave blank if there is no live site — the Visit button is hidden"
        />
        <Field
          name="repoUrl"
          label="Repo URL"
          defaultValue={project?.repoUrl ?? ""}
          hint="leave blank for private repos — a private repo 404s for visitors"
        />

        <Field
          name="tags"
          label="Tags"
          defaultValue={project?.tags.join(", ") ?? ""}
          hint="comma separated, lowercased on save"
        />

        <BodyEditor name="bodyMd" defaultValue={project?.bodyMd ?? ""} />

        <label className="flex items-center gap-2 font-burbankmedium">
          <input
            type="checkbox"
            name="published"
            defaultChecked={project?.published ?? false}
            className="w-4 h-4"
          />
          Published
        </label>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="font-burbankblack tracking-wider px-6 py-2 bg-primary text-white border-4 border-black hover:bg-secondary transition-all ease-out"
          >
            Save
          </button>
          {project && (
            <Link
              href={`/projects/${project.slug}`}
              className="text-sky-600 font-burbankmedium text-sm"
            >
              View public page &gt;
            </Link>
          )}
        </div>
      </form>

      {/* After the form, not inside it: nested forms are invalid HTML. Only on
          edit, since the object key is derived from a slug that must exist. */}
      {project && (
        <MediaField
          id={project.id}
          mediaKey={project.mediaKey}
          title={project.title}
        />
      )}
      {!project && (
        <p className="font-burbankmedium text-sm opacity-60">
          Save the project first to add an image.
        </p>
      )}
    </section>
  )
}

type BaseProps = {
  name: string
  label: string
  defaultValue?: string
  required?: boolean
  hint?: string
}

const inputClass =
  "w-full border-4 border-black dark:border-primary bg-white dark:bg-black px-3 py-2 font-burbankmedium"

function Field({ name, label, defaultValue, required, hint }: BaseProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-burbankblack text-sm tracking-wide">
        {label}
        {required && " *"}
      </span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        required={required}
        className={inputClass}
      />
      {hint && <span className="text-xs font-burbankmedium opacity-60">{hint}</span>}
    </label>
  )
}

function Area({
  name,
  label,
  defaultValue,
  required,
  hint,
  rows = 4,
}: BaseProps & { rows?: number }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-burbankblack text-sm tracking-wide">
        {label}
        {required && " *"}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={rows}
        className={`${inputClass} font-mono text-sm`}
      />
      {hint && <span className="text-xs font-burbankmedium opacity-60">{hint}</span>}
    </label>
  )
}
