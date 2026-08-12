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
import { getSettings } from "@/data/settings"

// Server actions rather than route handlers: a browser cannot hold a D1 or R2
// binding. Action POSTs target the page URL they originate from, so the
// /admin/* Access policy and the middleware matcher already cover them —
// there is no separate endpoint to secure.

/** Empty form fields arrive as "", which must become NULL rather than "". */
function nullable(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : ""
  return s === "" ? null : s
}

function required(value: FormDataEntryValue | null, field: string): string {
  const s = typeof value === "string" ? value.trim() : ""
  if (s === "") throw new Error(`${field} is required`)
  return s
}

function parse(form: FormData): ProjectInput {
  const slug = required(form.get("slug"), "slug")
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error("slug must be lowercase letters, digits and hyphens")
  }

  return {
    slug,
    title: required(form.get("title"), "title"),
    description: required(form.get("description"), "description"),
    siteUrl: nullable(form.get("siteUrl")),
    repoUrl: nullable(form.get("repoUrl")),
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

export async function createProjectAction(form: FormData) {
  const input = parse(form)
  await createProject(input)
  revalidatePublic(input.slug)
  revalidatePath("/admin")
  redirect("/admin")
}

export async function updateProjectAction(id: string, form: FormData) {
  const input = parse(form)
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
  revalidatePath(`/admin/${id}`)
}

export async function removeMediaAction(id: string) {
  const project = await getAdminProject(id)
  if (!project?.mediaKey) return

  await deleteMediaIfUnreferenced(project.mediaKey, id)
  await setMediaKey(id, null)
  revalidatePublic(project.slug)
  revalidatePath("/admin")
  revalidatePath(`/admin/${id}`)
}

/** The site pages, which the edge caches — a write is invisible without this. */
function revalidateSite() {
  revalidatePath("/")
  revalidatePath("/me")
  revalidatePath("/admin/settings")
}

export async function saveSettingsAction(form: FormData) {
  await saveSettings({
    heroEyebrow: nullable(form.get("heroEyebrow")),
    heroHeading: nullable(form.get("heroHeading")),
    heroBodyMd: nullable(form.get("heroBodyMd")),
    heroCtaLabel: nullable(form.get("heroCtaLabel")),
    heroCtaHref: nullable(form.get("heroCtaHref")),
    developerTitle: nullable(form.get("developerTitle")),
    developerName: nullable(form.get("developerName")),
    developerBadge: nullable(form.get("developerBadge")),
    bioMd: nullable(form.get("bioMd")),
    contactEmail: nullable(form.get("contactEmail")),
    contactPhone: nullable(form.get("contactPhone")),
    contactLocation: nullable(form.get("contactLocation")),
    // Images are written by their own action; carry the current values through
    // so saving the text does not wipe them.
    developerMediaKey: nullable(form.get("developerMediaKey")),
    backgroundMediaKey: nullable(form.get("backgroundMediaKey")),
  })
  revalidateSite()
}

type SettingsImage = "developerMediaKey" | "backgroundMediaKey"

export async function uploadSettingsImageAction(
  field: SettingsImage,
  form: FormData,
) {
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
}

export async function removeSettingsImageAction(field: SettingsImage) {
  const current = await getSettingsRow()
  const previous = current?.[field] ?? null
  if (!previous) return

  await setSettingsMediaKey(field, null)
  await deleteMediaIfUnreferenced(previous)
  revalidateSite()
}

/** Exposed so the settings page can render the current values. */
export async function readSettingsForAdmin() {
  return { row: await getSettingsRow(), effective: await getSettings() }
}
