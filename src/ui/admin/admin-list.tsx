import Link from "next/link"
import type { AdminProject } from "@/data/projects/admin"
import {
  deleteProjectAction,
  moveProjectAction,
  togglePublishedAction,
} from "@/app/admin/actions"

// A server component. Every mutation is a form posting to a server action, so
// this page works without client-side JavaScript and needs no fetch layer.
export default function AdminList({ projects }: { projects: AdminProject[] }) {
  return (
    <section className="px-5 py-20 max-w-4xl mx-auto flex flex-col gap-8">
      <header className="flex items-end justify-between gap-4 border-b-4 border-black dark:border-primary pb-4">
        <div>
          <h1 className="font-display text-3xl tracking-wider uppercase">
            Projects
          </h1>
          <p className="font-body text-sm">
            {projects.length} total ·{" "}
            {projects.filter((p) => p.published).length} published
          </p>
        </div>
        <Link
          href="/admin/new"
          className="font-display tracking-wider px-4 py-2 bg-primary text-white border-4 border-black hover:bg-secondary transition-all ease-out"
        >
          + New
        </Link>
      </header>

      {projects.length === 0 ? (
        <p className="font-body">No projects yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {projects.map((project, index) => (
            <li
              key={project.id}
              className="flex items-center gap-3 border-4 border-black dark:border-primary p-3"
            >
              {/* Reorder. Disabled at the ends rather than hidden, so the
                  controls do not shift position between rows. */}
              <div className="flex flex-col gap-1">
                <MoveButton
                  id={project.id}
                  direction="up"
                  disabled={index === 0}
                />
                <MoveButton
                  id={project.id}
                  direction="down"
                  disabled={index === projects.length - 1}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/${project.id}`}
                    className="font-display truncate hover:text-primary transition-all ease-out"
                  >
                    {project.title}
                  </Link>
                  {!project.published && (
                    <span className="text-xs font-body border-2 border-current px-1 shrink-0">
                      draft
                    </span>
                  )}
                  {!project.mediaKey && (
                    <span className="text-xs font-body opacity-60 shrink-0">
                      no image
                    </span>
                  )}
                  {!project.bodyMd && (
                    <span className="text-xs font-body opacity-60 shrink-0">
                      no write-up
                    </span>
                  )}
                </div>
                <p className="font-body text-xs opacity-70 truncate">
                  /{project.slug}
                  {project.tags.length > 0 && ` · ${project.tags.join(", ")}`}
                </p>
              </div>

              <form action={togglePublishedAction.bind(null, project.id, !project.published)}>
                <button
                  type="submit"
                  className="font-body text-xs border-2 border-current px-2 py-1 hover:bg-primary hover:text-white transition-all ease-out"
                >
                  {project.published ? "Unpublish" : "Publish"}
                </button>
              </form>

              {/* No confirmation dialog: a delete is one click, but the row is
                  small and the action is destructive, so the label is explicit
                  rather than an icon. */}
              <form action={deleteProjectAction.bind(null, project.id)}>
                <button
                  type="submit"
                  className="font-body text-xs border-2 border-current px-2 py-1 hover:bg-red-600 hover:text-white transition-all ease-out"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function MoveButton({
  id,
  direction,
  disabled,
}: {
  id: string
  direction: "up" | "down"
  disabled: boolean
}) {
  return (
    <form action={moveProjectAction.bind(null, id, direction)}>
      <button
        type="submit"
        disabled={disabled}
        aria-label={`Move ${direction}`}
        className="w-6 h-5 text-xs border-2 border-current leading-none disabled:opacity-25 hover:bg-primary hover:text-white transition-all ease-out"
      >
        {direction === "up" ? "▲" : "▼"}
      </button>
    </form>
  )
}
