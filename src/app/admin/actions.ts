"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  createProject,
  deleteProject,
  moveProject,
  setPublished,
  updateProject,
  type ProjectInput,
} from "@/data/admin-projects"

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
