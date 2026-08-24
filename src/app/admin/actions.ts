"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  createProject,
  deleteProject,
  getAdminProject,
  moveProject,
  setMediaKey,
  setPublished,
  updateProject,
  type ProjectInput,
} from "@/data/projects/admin"
import { deleteMediaIfUnreferenced, putMedia } from "@/data/projects/media"
import {
  getSettingsRow,
  saveSettings,
  setSettingsMediaKey,
} from "@/data/settings-admin"
import { getSettings, type SiteSettingsText } from "@/data/settings"
import { httpUrl, linkHref, nullable, projectSlug, required } from "@/lib/form"

// Server actions rather than route handlers: a browser cannot hold a D1 or R2
// binding. Action POSTs target the page URL they originate from, so the
// /admin/* Access policy and the middleware matcher already cover them —
// there is no separate endpoint to secure.

// nullable, required, projectSlug, httpUrl and linkHref live in @/lib/form so
// they can be tested without a D1 binding — this module is "use server", so
// importing it drags the whole data layer in.

function parse(form: FormData): ProjectInput {
  return {
    slug: projectSlug(form.get("slug")),
    title: required(form.get("title"), "title"),
    description: required(form.get("description"), "description"),
    // Scheme-checked rather than passed through. Both reach an href on the
    // card, the detail page and the JSON API.
    siteUrl: httpUrl(form.get("siteUrl"), "site URL"),
    repoUrl: httpUrl(form.get("repoUrl"), "repo URL"),
    bodyMd: nullable(form.get("bodyMd")),
    role: nullable(form.get("role")),
    year: nullable(form.get("year")),
    published: form.get("published") === "on",
    tags: (nullable(form.get("tags")) ?? "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
  }
}

/**
 * Public pages read D1 at request time but sit behind Cloudflare's edge cache,
 * so a write is invisible until the paths are revalidated. `/` and `/me` both
 * render the project list, so all four move together.
 */
function revalidatePublic(slug?: string) {
  revalidatePath("/")
  revalidatePath("/me")
  revalidatePath("/projects")
  if (slug) revalidatePath(`/projects/${slug}`)
}

/**
 * Sends a failed action back to the page it was submitted from, with the
 * reason.
 *
 * Every message `putMedia` raises — the unsupported type, the size, the empty
 * file — was unreachable from the browser before this existed. The same is now
 * true of the validation in `parse`: a rejected slug or a `javascript:` URL
 * has to come back as text on the form, not as a blank 500.
 * The admin forms
 * are server components, so there is no `useActionState` to return a value
 * through, and an uncaught throw reaches `src/app/error.tsx` with the message
 * stripped in production. The result was a blank 500 for every cause.
 *
 * A query param rather than component state because these forms work without
 * JavaScript: a no-JS submit is a full page load, which discards state and
 * keeps the URL.
 *
 * The message is truncated because it can embed `file.type`, which the browser
 * supplies and a client can set to anything. React escapes it on render; the
 * cap is about not putting an arbitrary-length string in the URL.
 */
function fail(
  path: string,
  error: unknown,
  extra: Record<string, string> = {},
): never {
  const message =
    error instanceof Error && error.message
      ? error.message
      : // Reachable from parse and parseSettings too now, not only uploads, so
        // it cannot name one of them. Only a non-Error throw gets here.
        "the change was rejected"
  const params = new URLSearchParams({ error: message.slice(0, 160), ...extra })
  redirect(`${path}?${params}`)
}

// `field: "form"` so the route can tell a rejected field from a failed image
// upload. /admin/[id] renders both, and a message under the wrong one reads as
// a different thing having failed.
const FORM = { field: "form" }

export async function createProjectAction(form: FormData) {
  let input: ProjectInput
  try {
    input = parse(form)
  } catch (error) {
    // Outside the write, and `fail` redirects — so this cannot swallow the
    // redirect's own throw the way a try around the whole body would.
    fail("/admin/new", error, FORM)
  }

  await createProject(input)
  revalidatePublic(input.slug)
  revalidatePath("/admin")
  redirect("/admin")
}

export async function updateProjectAction(id: string, form: FormData) {
  let input: ProjectInput
  try {
    input = parse(form)
  } catch (error) {
    fail(`/admin/${id}`, error, FORM)
  }

  await updateProject(id, input)
  revalidatePublic(input.slug)
  revalidatePath("/admin")
  redirect("/admin")
}

export async function deleteProjectAction(id: string) {
  await deleteProject(id)
  revalidatePublic()
  revalidatePath("/admin")
}

export async function togglePublishedAction(id: string, published: boolean) {
  await setPublished(id, published)
  revalidatePublic()
  revalidatePath("/admin")
}

export async function moveProjectAction(id: string, direction: "up" | "down") {
  await moveProject(id, direction)
  revalidatePublic()
  revalidatePath("/admin")
}

export async function uploadMediaAction(id: string, form: FormData) {
  const back = `/admin/${id}`

  try {
    const file = form.get("image")
    if (!(file instanceof File) || file.size === 0) {
      throw new Error("choose an image first")
    }

    const project = await getAdminProject(id)
    if (!project) throw new Error("project not found")

    const key = await putMedia(file, project.slug)

    // Replacing an image leaves the old object behind otherwise. Removed only
    // when the key changed — re-uploading identical bytes yields the same key.
    if (project.mediaKey && project.mediaKey !== key) {
      await deleteMediaIfUnreferenced(project.mediaKey, id)
    }

    await setMediaKey(id, key)
    revalidatePublic(project.slug)
    revalidatePath("/admin")
    revalidatePath(back)
  } catch (error) {
    fail(back, error)
  }

  // Outside the try, because redirect signals by throwing and the catch above
  // would turn a success into a reported failure. Redirecting at all is what
  // clears an ?error left by a previous attempt.
  redirect(back)
}

export async function removeMediaAction(id: string) {
  const back = `/admin/${id}`

  try {
    // Nothing to remove is a no-op, not an early return: falling through to
    // the redirect is what clears a stale ?error from the URL. Returning here
    // left the previous failure on screen after a successful submit.
    const project = await getAdminProject(id)
    if (project?.mediaKey) {
      await deleteMediaIfUnreferenced(project.mediaKey, id)
      await setMediaKey(id, null)
      revalidatePublic(project.slug)
      revalidatePath("/admin")
      revalidatePath(back)
    }
  } catch (error) {
    fail(back, error)
  }

  redirect(back)
}

/** The site pages, which the edge caches — a write is invisible without this. */
function revalidateSite() {
  revalidatePath("/")
  revalidatePath("/me")
  revalidatePath("/admin/settings")
}

export async function saveSettingsAction(form: FormData) {
  let input: SiteSettingsText
  try {
    input = parseSettings(form)
  } catch (error) {
    fail("/admin/settings", error, FORM)
  }

  await saveSettings(input)
  revalidateSite()

  // Redirects for the same reason the media actions do, even though it writes
  // no ?error of its own. An action POST targets the URL it came from, so
  // saving text from /admin/settings?error=… re-renders that URL and puts the
  // failed upload's message back on screen after an unrelated success.
  redirect("/admin/settings")
}

/**
 * The text columns only.
 *
 * The two media columns are deliberately absent. They used to ride along as
 * hidden inputs rendered from the current row, which stopped a text save
 * wiping them but introduced a lost update: save text from a page that was
 * rendered before an upload, and the stale key goes back. `setSettingsMediaKey`
 * is the only writer of those columns now, so there is nothing to carry.
 */
function parseSettings(form: FormData): SiteSettingsText {
  return {
    heroEyebrow: nullable(form.get("heroEyebrow")),
    heroHeading: nullable(form.get("heroHeading")),
    heroBodyMd: nullable(form.get("heroBodyMd")),
    heroCtaLabel: nullable(form.get("heroCtaLabel")),
    // May be a path or an off-site URL; both are checked.
    heroCtaHref: linkHref(form.get("heroCtaHref"), "hero CTA link"),
    developerTitle: nullable(form.get("developerTitle")),
    developerName: nullable(form.get("developerName")),
    developerBadge: nullable(form.get("developerBadge")),
    bioMd: nullable(form.get("bioMd")),
    contactEmail: nullable(form.get("contactEmail")),
    contactPhone: nullable(form.get("contactPhone")),
    contactLocation: nullable(form.get("contactLocation")),
  }
}

type SettingsImage = "developerMediaKey" | "backgroundMediaKey"

export async function uploadSettingsImageAction(
  field: SettingsImage,
  form: FormData,
) {
  const back = "/admin/settings"

  try {
    const file = form.get("image")
    if (!(file instanceof File) || file.size === 0) {
      throw new Error("choose an image first")
    }

    const name = field === "developerMediaKey" ? "developer" : "background"
    const key = await putMedia(file, name, "site")

    const current = await getSettingsRow()
    const previous = current?.[field] ?? null

    await setSettingsMediaKey(field, key)

    // Only after the column no longer points at it — deleteMediaIfUnreferenced
    // checks the settings row, so clearing first is what makes the object
    // eligible.
    if (previous && previous !== key) {
      await deleteMediaIfUnreferenced(previous)
    }

    revalidateSite()
  } catch (error) {
    // `field` too: there are two image forms on this page, and an error under
    // the wrong one reads as a different upload having failed.
    fail(back, error, { field })
  }

  redirect(back)
}

export async function removeSettingsImageAction(field: SettingsImage) {
  const back = "/admin/settings"

  try {
    const current = await getSettingsRow()
    const previous = current?.[field] ?? null

    // As above: a no-op still redirects, so a stale ?error does not survive it.
    if (previous) {
      await setSettingsMediaKey(field, null)
      await deleteMediaIfUnreferenced(previous)
      revalidateSite()
    }
  } catch (error) {
    fail(back, error, { field })
  }

  redirect(back)
}

/** Exposed so the settings page can render the current values. */
export async function readSettingsForAdmin() {
  return { row: await getSettingsRow(), effective: await getSettings() }
}
