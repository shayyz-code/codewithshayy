// Asserts that every route reading D1 is dynamic, by reading the build
// manifests rather than the pretty-printed route table.
//
// The invariant: getCloudflareContext({ async: true }) resolves to *local*
// bindings during static generation, so a prerendered data route bakes the
// build machine's database into the deployed output. Nothing surfaces that
// until production serves empty data — every route still returns 200.
//
// Why not the previous check. It grepped the build log for
//   ^[├└┌│][^/]*ƒ ${route}$
// which works for three literal paths and quietly breaks on the fourth:
// extending it with `/projects/[slug]` puts `[slug]` into an extended regex
// as a character class matching one of s, l, u, g — so `ƒ /projects/s` would
// satisfy it, and the assertion passes vacuously. It also depends on the
// box-drawing characters Next happens to print today.
//
// Why not `grep -rl force-dynamic src/app` either. src/app/blog/page.tsx
// contains that string inside the comment "Do not add force-dynamic here",
// so the grep reports a deliberately-static route as a dynamic one. It is
// wrong about /blog before it has answered anything.
//
// The manifests are exact. Both directions are checked, because absence alone
// is not evidence: a route that was renamed or deleted is also absent from the
// prerender manifest, and would pass a one-sided check.
//
// This checks the property, not the proxy, and the difference is measurable.
// Removing `force-dynamic` from /projects/page.tsx flips it to `○` and this
// rejects. Removing it from /projects/[slug]/page.tsx does not: that route has
// no generateStaticParams, so there are no params to prerender and it stays
// `ƒ` — and this passes, correctly, because nothing is baked in. The export
// there is insurance against a later generateStaticParams, not the thing that
// makes it dynamic today. A check that grepped for the export would call that
// a failure and be wrong.

import { existsSync, readFileSync, statSync } from "node:fs"
import { dirname, join } from "node:path"
import { execSync } from "node:child_process"

const APP = ".next/app-path-routes-manifest.json"
const PRERENDER = ".next/prerender-manifest.json"

// Routes that must never be prerendered. Kept as an explicit list so the
// assertion states its own subject, and cross-checked against the source
// below so it cannot silently fall behind.
//
// /admin/new reads nothing itself and is here anyway: every sibling under
// /admin does, and a statically generated admin page is a bug whichever way
// it happens.
const GUARDED = [
  "/",
  "/me",
  "/projects",
  "/projects/[slug]",
  "/sitemap.xml",
  "/api/v1/projects",
  "/api/v1/projects/[slug]",
  "/admin",
  "/admin/new",
  "/admin/[id]",
  "/admin/settings",
]

// Metadata routes are not named after their file. Everything else derives.
const METADATA_ROUTES = { "src/app/sitemap.ts": "/sitemap.xml/route" }

const read = (path) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    console.error(`::error::cannot read ${path} — did \`next build\` run?`)
    process.exit(1)
  }
}

const app = read(APP)
const prerender = read(PRERENDER)

const routeOf = new Map(Object.entries(app).map(([key, route]) => [key, route]))
const prerendered = new Set([
  ...Object.keys(prerender.routes ?? {}),
  ...Object.keys(prerender.dynamicRoutes ?? {}),
])

// Routes that are prerendered and must stay so. This is the positive control,
// and it is not decoration: `prerender.routes ?? {}` degrades to an empty set
// if a Next release renames or nests those keys, and every `prerendered.has()`
// below would then be false — the script would print "none prerendered" and
// exit 0 while the whole site was static. The step this replaced carried the
// same property ("if the build output format ever changes, this must break
// loudly rather than pass vacuously") and it has to survive the replacement.
//
// /blog and /privacy are the two least likely to stop being prerendered: one is
// the file-based blog that exists to avoid database reads, the other reads
// nothing at all.
const MUST_BE_PRERENDERED = ["/blog", "/privacy"]

let failed = false
const fail = (message) => {
  console.error(`::error::${message}`)
  failed = true
}

// ---------------------------------------------------------------- assertions

const known = new Set(routeOf.values())

for (const route of MUST_BE_PRERENDERED) {
  if (!prerendered.has(route)) {
    fail(
      `${route} is not in ${PRERENDER}. Either it stopped being prerendered, ` +
        `or the manifest's shape changed and this check can no longer read it ` +
        `— in which case every assertion below is passing vacuously.`,
    )
  }
}

for (const route of GUARDED) {
  // Present: a typo, a rename or a deleted route must not pass by being absent
  // from the prerender manifest, which it would be.
  if (!known.has(route)) {
    fail(`${route} is in GUARDED but is not a route in ${APP}.`)
    continue
  }
  // Absent: this is the invariant itself.
  if (prerendered.has(route)) {
    fail(
      `${route} is prerendered. It reads D1, so the deploy would carry the ` +
        `build machine's database. Restore \`export const dynamic = "force-dynamic"\`.`,
    )
  }
}

// ------------------------------------------------------- coverage of GUARDED

// Every route module that reaches a D1 reader must be guarded, or this list
// becomes the next inventory that rots. Adding a D1-backed route without
// adding it here fails the build rather than being noticed three commits on.
// Which route modules actually reach D1, computed rather than named.
//
// Two earlier versions of this were wrong in opposite directions. Grepping for
// `from "@/data/(projects|settings)"` names two modules, so it rots the moment
// a third one reads D1 — and it is blind to the specifier every importer of
// db.ts actually uses, which is relative: `./db` or `../db`. Nothing in src/
// imports "@/data/db" at all, so no alias grep of any shape reaches the
// boundary. Widening to `from "@/data/` then flagged /blog, /blog/[slug],
// /rss.xml and both /api/v1/posts routes, which import @/data/posts: that
// reads the generated manifest, touches no database, and those routes MUST
// stay prerendered. Adding them to GUARDED would have broken the thing this
// file protects.
//
// So: walk the import graph from src/data/db.ts, the one module that calls
// getCloudflareContext for the D1 binding, and take the route files that reach
// it. No list to maintain and no module names to keep in step.
const DB_MODULE = "src/data/db.ts"

const SOURCES = execSync(
  `grep -rlE '' src --include='*.ts' --include='*.tsx' || true`,
  { encoding: "utf8" },
)
  .split("\n")
  .filter(Boolean)

// MUST_BE_PRERENDERED is the positive control for the manifest half. This half
// needs one too: if the enumeration above returns nothing, `importers` is empty,
// the coverage loop iterates zero times, and the script prints its success line
// having checked nothing. Assert the enumeration reached both ends of the walk.
if (!SOURCES.includes(DB_MODULE)) {
  fail(`source enumeration did not find ${DB_MODULE} — it checked nothing.`)
}
if (!SOURCES.some((f) => /^src\/app\/(.*\/)?(page|route)\.tsx?$/.test(f))) {
  fail("source enumeration found no route modules under src/app — it checked nothing.")
}

// db.ts is the only module allowed to touch the D1 binding, which is what makes
// "reaches db.ts" the same question as "reads D1". Without this, a route could
// call getCloudflareContext and read env.DB directly and the walk would not see
// it. env.MEDIA and env.IMAGES are deliberately not covered: R2 and Images are
// fetched at request time and do not bake into a prerender.
for (const file of SOURCES) {
  if (file === DB_MODULE) continue
  // Comments stripped first. The header of this file objects to
  // `grep -rl force-dynamic src/app` for reporting a route that only mentions
  // the string in prose; an assertion that fails on `// env.DB` would be the
  // same mistake in a smaller place.
  const code = readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
  if (/\benv\.DB\b/.test(code)) {
    fail(
      `${file} reads env.DB directly. Only ${DB_MODULE} may — the coverage ` +
        `walk below finds D1 routes by asking what reaches it.`,
    )
  }
}

/** Resolve an import specifier to a repo-relative path, or null if it is external. */
function resolve(from, spec) {
  let base
  if (spec.startsWith("@/")) base = `src/${spec.slice(2)}`
  else if (spec.startsWith(".")) base = join(dirname(from), spec)
  else return null

  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
  ]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
  }
  return null
}

// file -> the files it imports
const imports = new Map()
for (const file of SOURCES) {
  const src = readFileSync(file, "utf8")

  // `import type { Project } from "@/data/projects"` is erased at compile time
  // and creates no runtime dependency. Counting it made /docs, /openapi.json,
  // /blog/[slug] and both /api/v1/posts routes look like D1 readers — they
  // reach @/data/projects only for its `Project` type, through
  // structured-data.ts and api/v1/shared.ts. Marking those dynamic would have
  // un-prerendered four pages to satisfy an imaginary database read.
  //
  // Both quote styles are matched. The repo writes double quotes throughout and
  // nothing enforces that — there is no Prettier config and eslint.config.mjs is
  // core-web-vitals only — so a single-quoted import would otherwise be invisible
  // here and the route it belongs to would pass unguarded.
  const specs = [
    ...src.matchAll(
      /(?:^|\n)\s*(?:import|export)\b([\s\S]*?)from\s*["']([^"']+)["']/g,
    ),
  ]
    .filter((m) => !/^\s*type\s/.test(m[1]))
    .map((m) => m[2])

  // `await import("./db")` and `require("./db")` create exactly the runtime
  // dependency this walk is looking for, and match neither clause above.
  for (const m of src.matchAll(
    /\b(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g,
  )) {
    specs.push(m[1])
  }
  imports.set(
    file,
    specs.map((spec) => resolve(file, spec)).filter(Boolean),
  )
}

if (!existsSync(DB_MODULE)) {
  fail(`${DB_MODULE} does not exist — this check cannot find the D1 boundary.`)
}

/** Does `file` reach the D1 module, directly or through anything it imports? */
const reachesDb = new Map()
function reaches(file, seen = new Set()) {
  if (file === DB_MODULE) return true
  if (reachesDb.has(file)) return reachesDb.get(file)
  if (seen.has(file)) return false
  seen.add(file)

  const answer = (imports.get(file) ?? []).some((next) => reaches(next, seen))
  // Only cache once the walk is not inside a cycle, or a false from a
  // half-explored branch would be memoised as final.
  if (seen.size === 1 || answer) reachesDb.set(file, answer)
  return answer
}

const importers = SOURCES.filter((f) => f.startsWith("src/app/") && reaches(f))

for (const file of importers) {
  // Modules that are not themselves routes — actions.ts, shared.ts — are
  // reached through one that is, and that one is checked on its own.
  if (!/\/(page|route)\.tsx?$/.test(file) && !(file in METADATA_ROUTES)) continue

  const key =
    METADATA_ROUTES[file] ?? `/${file.replace(/^src\/app\/?/, "").replace(/\.tsx?$/, "")}`
  const route = routeOf.get(key)

  if (!route) {
    fail(`${file} maps to manifest key ${key}, which is not in ${APP}.`)
    continue
  }
  if (!GUARDED.includes(route)) {
    fail(
      `${file} reads D1 but ${route} is not in GUARDED ` +
        `(scripts/check-dynamic-routes.mjs). Add it.`,
    )
  }
}

if (failed) process.exit(1)

console.log(`dynamic routes: ${GUARDED.length} guarded, none prerendered`)
console.log(`prerendered: ${[...prerendered].sort().join(", ")}`)
