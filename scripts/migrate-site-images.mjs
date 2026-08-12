// One-off: moves the committed developer and background photos into R2 and
// writes a complete settings row.
//
// "Complete" is the important word. An earlier version of this wrote only the
// two media keys, which looked harmless and was not: getSettings falls back
// row-level, so the moment a row exists it is authoritative and every column
// left NULL renders as empty. That took the hero, the bio, the name band and
// the contact block off the live site until the row was filled in.
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

// Writes the media keys only. The row must already exist and be complete —
// setSettingsMediaKey seeds DEFAULTS when it creates one, and the admin form
// writes every column, so the only way to get a partial row is by hand.
console.log(
  `npx wrangler d1 execute codewithshayy ${flag} --command "UPDATE settings SET ${sets.join(
    ", ",
  )} WHERE id = 'site'"`,
)
console.log(
  `# If that reports 0 rows written, no settings row exists yet: save once in`,
)
console.log(`# the admin first, so the row is created complete.`)
