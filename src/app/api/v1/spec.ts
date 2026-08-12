import { SITE } from "./shared"

// The single description of this API. /openapi.json serves it and /docs renders
// it, so the page and the machine-readable spec cannot disagree — the failure
// mode of hand-written docs is that they drift from the thing they describe, and
// two hand-written copies drift twice as fast.
//
// It is still hand-maintained against the route handlers. scripts/smoke.sh reads
// the paths back out of this document and requests every one of them, so a path
// documented here and not implemented fails the build.

const project = {
  type: "object",
  required: [
    "slug",
    "title",
    "description",
    "url",
    "siteUrl",
    "repoUrl",
    "image",
    "role",
    "year",
    "tags",
  ],
  properties: {
    slug: { type: "string", description: "Stable public identifier." },
    title: { type: "string" },
    description: { type: "string" },
    url: { type: "string", format: "uri", description: "The page for humans." },
    siteUrl: {
      type: ["string", "null"],
      format: "uri",
      description: "Live site, null when there is none.",
    },
    repoUrl: {
      type: ["string", "null"],
      format: "uri",
      description: "Source, null when private or absent.",
    },
    image: {
      type: ["string", "null"],
      format: "uri",
      description:
        "Absolute. Accepts a ?w=<px> query for a resized webp variant.",
    },
    role: { type: ["string", "null"] },
    year: { type: ["string", "null"] },
    tags: { type: "array", items: { type: "string" } },
    body: {
      type: ["string", "null"],
      description:
        "Markdown long-form write-up. Detail endpoint only; null until authored.",
    },
  },
} as const

const post = {
  type: "object",
  required: ["slug", "title", "date", "summary", "url", "cover", "tags"],
  properties: {
    slug: { type: "string" },
    title: { type: "string" },
    date: { type: "string", format: "date" },
    summary: { type: "string" },
    url: { type: "string", format: "uri", description: "The article itself." },
    cover: { type: ["string", "null"], format: "uri" },
    tags: { type: "array", items: { type: "string" } },
  },
} as const

const notFound = {
  description: "No published record with that slug.",
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["error", "resource"],
        properties: {
          error: { type: "string", enum: ["not_found"] },
          resource: { type: "string" },
        },
      },
    },
  },
} as const

const slugParam = {
  name: "slug",
  in: "path",
  required: true,
  schema: { type: "string" },
} as const

const ok = (schema: unknown, description: string) => ({
  description,
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["data"],
        properties: { data: schema },
      },
    },
  },
})

export const spec = {
  openapi: "3.1.0",
  info: {
    title: "Code w/ Shayy",
    version: "1.0.0",
    description:
      "Read-only access to the published projects and posts behind codewithshayy.com. " +
      "No authentication, no write methods, and no rate limit beyond Cloudflare's. " +
      "Unpublished projects and draft posts are absent rather than forbidden.",
    license: {
      name: "PolyForm Noncommercial 1.0.0",
      url: "https://polyformproject.org/licenses/noncommercial/1.0.0/",
    },
  },
  servers: [{ url: SITE }],
  paths: {
    "/api/v1/projects": {
      get: {
        summary: "Published projects, in display order",
        description:
          "Ordered as the site orders them. `body` is omitted here — request a " +
          "single project for the long-form write-up.",
        responses: {
          "200": ok(
            { type: "array", items: project },
            "Every published project.",
          ),
        },
      },
    },
    "/api/v1/projects/{slug}": {
      get: {
        summary: "One project, including its markdown body",
        parameters: [slugParam],
        responses: {
          "200": ok(project, "The project."),
          "404": notFound,
        },
      },
    },
    "/api/v1/posts": {
      get: {
        summary: "Published posts, newest first",
        responses: {
          "200": ok({ type: "array", items: post }, "Every published post."),
        },
      },
    },
    "/api/v1/posts/{slug}": {
      get: {
        summary: "One post's metadata",
        description:
          "Metadata only. Posts are .mdx compiled at build time, so the prose " +
          "exists as a compiled component rather than as text the worker can " +
          "read — `url` is the article.",
        parameters: [slugParam],
        responses: {
          "200": ok(post, "The post."),
          "404": notFound,
        },
      },
    },
  },
  components: { schemas: { Project: project, Post: post } },
} as const
