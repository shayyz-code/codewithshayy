import type { Metadata } from "next"
import { spec } from "../api/v1/spec"

// Rendered on the server from the same object /openapi.json serves.
//
// A CDN-hosted renderer — Swagger UI, Redoc, Scalar — is not an option: the CSP
// in src/middleware.ts is `script-src 'self' 'unsafe-inline'`, which permits an
// inline script but no external `src`, so our own policy blocks every one of
// them and the failure would be a blank page rather than an error. Vendoring one
// into public/ would work but adds a large third-party bundle to a worker
// already at 1.45 MiB gzip (`wrangler deploy --dry-run`, this branch), to render
// four endpoints.
//
// A constant, like the spec: no database, no filesystem.
export const dynamic = "force-static"

export const metadata: Metadata = {
  alternates: { canonical: "/docs" },
  title: "API — Code w/ Shayy",
  description:
    "A read-only JSON API for the projects and posts on this site. No key, no signup.",
}

// Readonly throughout: the spec is declared `as const` so it cannot be mutated
// by a renderer, which means every array arrives readonly.
type SchemaLike = {
  type?: string | readonly string[]
  description?: string
  format?: string
  items?: SchemaLike
  enum?: readonly string[]
  properties?: Readonly<Record<string, SchemaLike>>
  required?: readonly string[]
}

/** `["string", "null"]` reads better as `string | null`. */
function typeOf(schema: SchemaLike): string {
  if (schema.type === "array" && schema.items) return `${typeOf(schema.items)}[]`
  if (typeof schema.type === "string") return schema.type
  return schema.type?.join(" | ") ?? "any"
}

function Fields({ schema }: { schema: SchemaLike }) {
  const properties = schema.properties ?? {}
  const required = new Set(schema.required ?? [])

  return (
    <dl className="flex flex-col gap-2">
      {Object.entries(properties).map(([name, field]) => (
        <div key={name} className="flex flex-col gap-1">
          <dt className="flex flex-wrap items-baseline gap-2">
            <code className="font-mono text-sm font-bold">{name}</code>
            <span className="font-mono text-xs opacity-70">
              {typeOf(field)}
            </span>
            {!required.has(name) && (
              <span className="text-xs uppercase tracking-wider opacity-60">
                optional
              </span>
            )}
          </dt>
          {field.description && (
            <dd className="text-sm opacity-80">{field.description}</dd>
          )}
        </div>
      ))}
    </dl>
  )
}

type Operation = {
  summary: string
  description?: string
  parameters?: readonly { name: string; in: string }[]
  responses: Record<string, { description: string }>
}

export default function PageDocs() {
  const paths = Object.entries(spec.paths) as [
    string,
    { get: Operation },
  ][]

  return (
    <main className="">
      <section className="flex flex-col">
        <div className="flex flex-col items-center py-28 md:py-40 gap-5">
          <div className="overflow-hidden flex flex-col gap-5 px-10 py-5 w-[350px] md:w-full md:max-w-2xl shadow-2xl shadow-orange-600 border-4 border-black">
            <h1 className="font-display text-3xl tracking-wider text-center my-5">
              API
            </h1>

            <p className="text-justify">{spec.info.description}</p>

            <p className="text-justify">
              The machine-readable description is at{" "}
              <a
                href="/openapi.json"
                className="text-sky-600 transition-all ease-out hover:text-blue-600"
              >
                /openapi.json
              </a>
              , and this page is rendered from that same document, so the two
              cannot disagree.
            </p>

            <h2 className="text-lg font-extrabold">Endpoints</h2>

            {paths.map(([path, operations]) => {
              const get = operations.get
              return (
                <div key={path} className="flex flex-col gap-2 my-2">
                  <h3 className="font-mono text-sm font-bold break-all">
                    <span className="mr-2 uppercase tracking-wider">GET</span>
                    {path}
                  </h3>
                  <p className="text-sm">{get.summary}</p>
                  {get.description && (
                    <p className="text-sm text-justify opacity-80">
                      {get.description}
                    </p>
                  )}
                  <ul className="text-sm opacity-80">
                    {Object.entries(get.responses).map(([code, response]) => (
                      <li key={code}>
                        <code className="font-mono font-bold">{code}</code>{" "}
                        {response.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}

            <h2 className="text-lg font-extrabold">Project</h2>
            <Fields schema={spec.components.schemas.Project} />

            <h2 className="text-lg font-extrabold">Post</h2>
            <Fields schema={spec.components.schemas.Post} />

            <h2 className="text-lg font-extrabold">Using it</h2>
            <p className="text-justify">
              Responses are wrapped in a <code className="font-mono">data</code>{" "}
              key. A slug that does not match a published record returns 404 with
              a JSON body rather than 200 carrying null, so an ordinary HTTP
              client handles the case for you.
            </p>
            <pre className="overflow-x-auto text-xs font-mono p-3 border-2 border-black">
              {`curl -s ${spec.servers[0].url}/api/v1/projects | jq '.data[].slug'`}
            </pre>
            <p className="text-justify">
              <code className="font-mono">access-control-allow-origin: *</code>{" "}
              is set, so a browser on any origin can read it. Responses cache for
              a minute. The content is licensed{" "}
              <a
                href={spec.info.license.url}
                className="text-sky-600 transition-all ease-out hover:text-blue-600"
              >
                {spec.info.license.name}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
