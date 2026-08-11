// One-off pre-flight archive, run before the courses/events/enroll deletion.
// Reads the Firestore collections that are about to be orphaned and writes
// them to disk. Read-only — never writes to Firebase.
//
// Usage: node archive-firestore.mjs <outDir>

import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs } from "firebase/firestore"
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"

const REPO = "/Users/yahs/Documents/projects/codewithshayy"
const outDir = process.argv[2]
if (!outDir) {
  console.error("usage: node archive-firestore.mjs <outDir>")
  process.exit(1)
}

// Parse .env.local by hand — this runs outside Next, so no automatic loading.
const env = {}
for (const line of readFileSync(join(REPO, ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}

// Firestore reads need apiKey + projectId only. Note the repo's storageBucket
// var is misspelled (..._BACKET); irrelevant here, but that is why Storage
// uploads have been broken.
const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_API_KEY,
  authDomain: env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_PROJECT_ID,
})
const db = getFirestore(app)

const COLLECTIONS = [
  "courses",
  "courses_brief",
  "events",
  "enrolled",
  "projects", // not deleted, but snapshot it as the §8 migration baseline
]

mkdirSync(outDir, { recursive: true })

const summary = []
let failed = false

for (const name of COLLECTIONS) {
  try {
    const snap = await getDocs(collection(db, name))
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    writeFileSync(
      join(outDir, `${name}.json`),
      JSON.stringify(docs, null, 2) + "\n",
    )
    summary.push({ collection: name, docs: docs.length, status: "ok" })
  } catch (err) {
    summary.push({ collection: name, docs: 0, status: `FAILED: ${err.code || err.message}` })
    failed = true
  }
}

console.table(summary)

// enrolled holds names + emails. Emit a CSV alongside so it is usable without
// the JSON, and so it is obvious this file is PII.
try {
  const enrolled = JSON.parse(
    readFileSync(join(outDir, "enrolled.json"), "utf8"),
  )
  if (enrolled.length) {
    const cols = [...new Set(enrolled.flatMap((r) => Object.keys(r)))]
    const esc = (v) => {
      const s = typeof v === "object" && v !== null ? JSON.stringify(v) : String(v ?? "")
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const csv = [
      cols.join(","),
      ...enrolled.map((r) => cols.map((c) => esc(r[c])).join(",")),
    ].join("\n")
    writeFileSync(join(outDir, "enrolled-PII.csv"), csv + "\n")
    console.log(`\nwrote enrolled-PII.csv (${enrolled.length} rows, ${cols.length} cols)`)
  } else {
    console.log("\nenrolled is empty — no CSV written")
  }
} catch {
  console.log("\nskipped enrolled CSV")
}

console.log(`\noutput: ${outDir}`)
process.exit(failed ? 1 : 0)
