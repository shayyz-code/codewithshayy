#!/usr/bin/env bash
# Dumps production D1 and the R2 objects it references.
#
# This exists because the D1 migration moved every project, write-up, and the
# whole of the site's copy — hero, bio, name band, contact block — out of git
# and into a database with no second copy. The repo already has an incident
# where a migration blanked every page while all routes returned 200; today
# that is unrecoverable.
#
# `wrangler r2 object` has no listing command — only get, put and delete — so
# the media set is derived from D1 rather than enumerated from the bucket.
# (`wrangler r2 bucket` *does* have `list` and `info`; this script calls
# `bucket info` below. An earlier version of this comment said "wrangler r2 has
# no listing command", which is wrong and which this file then contradicted
# 138 lines later.)
#
# Deriving from D1 is also the better set: keys are content-addressed and
# referenced from exactly two tables, so anything not named here is
# unreferenced and `deleteMediaIfUnreferenced` would already remove it.
#
# Usage:
#   scripts/backup.sh                      # remote, into backups/<UTC>/
#   scripts/backup.sh --local              # against local D1, for testing
#   scripts/backup.sh --out DIR            # somewhere else
#   scripts/backup.sh --allow-empty        # do not fail on zero projects
#
# Exit codes: 0 ok, 1 the dump is unusable, 2 bad arguments.

set -euo pipefail

DB=codewithshayy
BUCKET=codewithshayy-media
TARGET=--remote
OUT=""
ALLOW_EMPTY=0

while [ $# -gt 0 ]; do
  case "$1" in
    --local)       TARGET=--local ;;
    --remote)      TARGET=--remote ;;
    --allow-empty) ALLOW_EMPTY=1 ;;
    --out)         OUT="${2:-}"; shift ;;
    *) echo "unknown argument: $1" >&2; exit 2 ;;
  esac
  shift
done

STAMP=$(date -u +%Y-%m-%dT%H-%M-%SZ)
OUT="${OUT:-backups/$STAMP}"
mkdir -p "$OUT/media"

echo "backup: $DB $TARGET -> $OUT"

# ---------------------------------------------------------------- D1

# The single-file dump `wrangler d1 export` produces **does not restore**.
# Measured: `project_tags` is written before `tags`, so replaying it fails at
# the first row with
#   no such table: main.tags: SQLITE_ERROR
# The order is not alphabetical — `settings` sorts before `tags` and is written
# after it — and is not documented anywhere, so derive it rather than predict
# it. The `PRAGMA defer_foreign_keys=TRUE` at the head of that file does not
# save it: the pragma is cleared at the end of every transaction and the replay
# autocommits per statement.
#
# Exporting schema and data separately does restore. Verified against a fresh
# local database (3/2/2 rows out, 3/2/2 back, same slugs) and then against
# production on 2026-08-24: 7 projects / 21 tags / 29 project_tags / 1 settings
# row and 8 of 8 media objects, restored at identical counts with the settings
# row intact. So two files, and a restore is two commands in this order.
SCHEMA="$OUT/d1-schema.sql"
DATA="$OUT/d1-data.sql"

pnpm exec wrangler d1 export "$DB" $TARGET --no-data   --output "$SCHEMA" --skip-confirmation
pnpm exec wrangler d1 export "$DB" $TARGET --no-schema --output "$DATA"   --skip-confirmation

for f in "$SCHEMA" "$DATA"; do
  if [ ! -s "$f" ]; then
    echo "FAIL  the export is empty or absent: $f" >&2
    exit 1
  fi
done

# A dump that parses is not a dump that holds anything. `wrangler d1 export`
# succeeds against an empty database and writes a schema-only file, which is
# exactly what a blanked database produces — so the schema is not the check.
if ! grep -q 'CREATE TABLE' "$SCHEMA"; then
  echo "FAIL  no CREATE TABLE in $SCHEMA — this is not a schema dump" >&2
  exit 1
fi

# --------------------------------------------------------- row counts

# Reported rather than assumed, because "the backup ran" and "the backup holds
# the site" are different claims and only the second one matters. Same reason
# release-verify checks rendered output instead of status codes.
counts_json=$(pnpm exec wrangler d1 execute "$DB" $TARGET --json --command \
  "SELECT (SELECT count(*) FROM projects) AS projects,
          (SELECT count(*) FROM tags) AS tags,
          (SELECT count(*) FROM project_tags) AS project_tags,
          (SELECT count(*) FROM settings) AS settings")

eval "$(node -e '
let raw = ""
process.stdin.on("data", (d) => (raw += d))
process.stdin.on("end", () => {
  // wrangler prints progress before the JSON on some paths, so start at the
  // first bracket rather than parsing the whole stream.
  const start = raw.indexOf("[")
  const rows = JSON.parse(raw.slice(start))[0].results[0]
  for (const [k, v] of Object.entries(rows)) console.log(`N_${k}=${v}`)
})' <<< "$counts_json")"

printf "  projects       %s\n  tags           %s\n  project_tags   %s\n  settings       %s\n" \
  "$N_projects" "$N_tags" "$N_project_tags" "$N_settings"

if [ "$N_projects" -eq 0 ] && [ "$ALLOW_EMPTY" -eq 0 ]; then
  echo "FAIL  zero projects. Either the database is empty or this ran against" >&2
  echo "      the wrong one. Pass --allow-empty if that is genuinely expected." >&2
  exit 1
fi

# Zero is legitimate — getSettings falls back to DEFAULTS when the row is
# absent, and it stays absent until the first admin save. Worth saying out
# loud, because on the live site it would mean the row was deleted.
if [ "$N_settings" -eq 0 ]; then
  echo "  note: no settings row; the site is running on DEFAULTS"
fi

# ---------------------------------------------------------------- R2

# The referenced set, from the same two tables deleteMediaIfUnreferenced
# checks. A key in one and not the other is still one object.
keys_json=$(pnpm exec wrangler d1 execute "$DB" $TARGET --json --command \
  "SELECT media_key AS k FROM projects WHERE media_key IS NOT NULL
   UNION SELECT developer_media_key FROM settings WHERE developer_media_key IS NOT NULL
   UNION SELECT background_media_key FROM settings WHERE background_media_key IS NOT NULL")

node -e '
let raw = ""
process.stdin.on("data", (d) => (raw += d))
process.stdin.on("end", () => {
  const start = raw.indexOf("[")
  const rows = JSON.parse(raw.slice(start))[0].results
  for (const r of rows) console.log(r.k)
})' <<< "$keys_json" > "$OUT/media-keys.txt"

MEDIA_TOTAL=$(wc -l < "$OUT/media-keys.txt" | tr -d ' ')
echo "  media keys     $MEDIA_TOTAL"

# Whether the bucket is reachable with these credentials is a different
# question from whether any given key is in it, and it needs its own
# instrument. Counting failed fetches cannot separate the two: with one
# referenced key, "all of them failed" and "that row is dangling" are the same
# observation. `bucket info` answers only the first, and is remote-only.
if [ "$TARGET" = "--remote" ]; then
  if ! pnpm exec wrangler r2 bucket info "$BUCKET" >/dev/null 2>&1; then
    echo "FAIL  cannot reach $BUCKET — check credentials and the bucket name." >&2
    exit 1
  fi
fi

MISSING=""
FETCHED=0
while IFS= read -r key; do
  [ -z "$key" ] && continue
  dest="$OUT/media/$key"
  mkdir -p "$(dirname "$dest")"
  # get has been seen exiting 0 having written nothing, so size is the check
  # rather than the exit code.
  if pnpm exec wrangler r2 object get "$BUCKET/$key" $TARGET --file "$dest" >/dev/null 2>&1 \
     && [ -s "$dest" ]; then
    FETCHED=$((FETCHED + 1))
  else
    MISSING="$MISSING $key"
    rm -f "$dest"
  fi
done < "$OUT/media-keys.txt"

if [ -n "$MISSING" ]; then
  # A dangling reference is a real finding — the row points at an object the
  # bucket does not have, which renders as a broken image rather than as an
  # error — but it is a property of the *data*, not of this dump. Failing here
  # would wedge db:migrate:remote behind a bad row that predates it, so record
  # it and keep the backup.
  for k in $MISSING; do echo "$k"; done > "$OUT/dangling.txt"
  echo "WARN  referenced in D1 but not fetched from $BUCKET:" >&2
  for k in $MISSING; do echo "        $k" >&2; done
  echo "      recorded in $OUT/dangling.txt" >&2
fi

echo "  media fetched  $FETCHED/$MEDIA_TOTAL"

echo "ok    $OUT ($(du -sh "$OUT" | cut -f1))"
echo
echo "Restore, schema first — the order is load-bearing:"
echo "  pnpm exec wrangler d1 execute $DB --local --file $SCHEMA -y"
echo "  pnpm exec wrangler d1 execute $DB --local --file $DATA   -y"
