// One-off: moves the committed developer and background photos into R2 and
// points the settings row at them, so public/ can stop carrying content.
//
// Run against the remote bucket and database before deleting the files:
//   node scripts/migrate-site-images.mjs --remote
//
// Prints the wrangler commands rather than shelling out, so the keys can be
// checked before anything is written. The hash matches putMedia's scheme —
// first four bytes of a SHA-256 — so a later upload of the same file dedupes to
// the same object instead of orphaning this one.
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"

const remote = process.argv.includes("--remote")
const flag = remote ? "--remote" : "--local"

const files = [
  { path: "public/developer.webp", name: "developer", column: "developer_media_key" },
  { path: "public/bg4.webp", name: "background", column: "background_media_key" },
]

const sets = []
for (const f of files) {
  const bytes = readFileSync(f.path)
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 8)
  const key = `site/${f.name}-${hash}.webp`
  console.log(
    `npx wrangler r2 object put codewithshayy-media/${key} --file ${f.path} --content-type image/webp ${flag}`,
  )
  sets.push(`${f.column} = '${key}'`)
}

// The row may not exist yet, so upsert rather than update.
console.log(
  `npx wrangler d1 execute codewithshayy ${flag} --command "INSERT INTO settings (id, ${files
    .map((f) => f.column)
    .join(", ")}) VALUES ('site', ${files
    .map((_, i) => `'${sets[i].split("'")[1]}'`)
    .join(", ")}) ON CONFLICT(id) DO UPDATE SET ${sets.join(", ")}"`,
)
