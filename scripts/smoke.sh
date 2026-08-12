#!/usr/bin/env bash
# Boots the built worker under local workerd and asserts every route.
#
# This exists because `next build` passing proves very little here. Every
# serious failure in this project's history — protobufjs calling `new Function`
# at import time, a readdirSync against a filesystem the worker does not have,
# prerendered pages 404ing with NoFallbackError — compiled cleanly and only
# broke under workerd.
#
# Assumes `opennextjs-cloudflare build` has already run, and that local D1 has
# had migrations and seeds/ci.sql applied.
#
# Usage: scripts/smoke.sh [port]

set -uo pipefail

PORT="${1:-8788}"
BASE="http://localhost:$PORT"
LOG=$(mktemp)
FAILED=0
# The observability store lives in .wrangler/ and survives restarts, so any
# query here must be time-bounded or it reports an earlier run's errors. This
# check read 432 stale rows before it was bounded.
STARTED_MS=$(( $(date +%s) * 1000 ))

cleanup() {
  [[ -n "${PREVIEW_PID:-}" ]] && kill "$PREVIEW_PID" 2>/dev/null
  pkill -f "wrangler dev" 2>/dev/null
  pkill -f workerd 2>/dev/null
  return 0
}
trap cleanup EXIT

echo "booting worker on :$PORT"
npx opennextjs-cloudflare preview --port "$PORT" >"$LOG" 2>&1 &
PREVIEW_PID=$!

for _ in $(seq 1 60); do
  sleep 2
  curl -sf -o /dev/null "$BASE/privacy" 2>/dev/null && break
done

if ! curl -sf -o /dev/null "$BASE/privacy" 2>/dev/null; then
  echo "::error::worker never became ready"
  tail -30 "$LOG"
  exit 1
fi

# expect <path> <status>
expect() {
  local path="$1" want="$2" got
  got=$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$BASE$path")
  if [[ "$got" == "$want" ]]; then
    printf '  ok    %-28s %s\n' "$path" "$got"
  else
    printf '  FAIL  %-28s got %s, want %s\n' "$path" "$got" "$want"
    FAILED=1
  fi
}

# expect_body <path> <substring>
#
# Retries, because responses are streamed and a cold worker has been observed
# delivering only the document head before the body arrives — which reads as a
# missing needle even though the page is correct. A genuine miss fails all three
# attempts; the byte count is reported so truncation stays distinguishable from
# absence.
expect_body() {
  local path="$1" needle="$2" body size
  body=$(mktemp)

  for attempt in 1 2 3; do
    curl -s --max-time 30 "$BASE$path" >"$body"
    if grep -qF -- "$needle" "$body"; then
      size=$(wc -c <"$body" | tr -d ' ')
      if [[ "$attempt" == "1" ]]; then
        printf '  ok    %-28s contains %q\n' "$path" "$needle"
      else
        printf '  ok    %-28s contains %q (attempt %s, %sB)\n' \
          "$path" "$needle" "$attempt" "$size"
      fi
      rm -f "$body"
      return 0
    fi
    sleep 2
  done

  size=$(wc -c <"$body" | tr -d ' ')
  printf '  FAIL  %-28s missing %q after 3 attempts (last body %sB)\n' \
    "$path" "$needle" "$size"
  printf '        got (first 400 chars):\n'
  tr -d '\n' <"$body" | cut -c1-400 | sed 's/^/        /'
  printf '\n'
  rm -f "$body"
  FAILED=1
}

# Warm every route first. The first request to a route under workerd is the
# slowest, and a cold streamed response is what produced head-only bodies.
for p in / /me /projects /blog /blog/hello /rss.xml /privacy /terms \
         /projects/ci-fixture-full /projects/ci-fixture-bare; do
  curl -s -o /dev/null --max-time 30 "$BASE$p"
done

echo "public routes"
for p in / /me /projects /blog /privacy /terms; do expect "$p" 200; done
expect /rss.xml 200
expect /blog/hello 200

echo "project detail, from the CI fixture in D1"
expect /projects/ci-fixture-full 200
expect /projects/ci-fixture-bare 200
# published = 0 must not be reachable, or unpublished work leaks.
expect /projects/ci-fixture-draft 404
expect /projects/does-not-exist 404

# The admin's expected status depends on whether the local bypass is active.
# .dev.vars is read by local wrangler and never uploaded, so CI and the deployed
# worker always take the 404 branch. Asserting a single value would make this
# test either wrong locally or vacuous in CI.
if [[ -f .dev.vars ]] && grep -q '^ADMIN_LOCAL_BYPASS=1' .dev.vars 2>/dev/null; then
  echo "admin (local bypass active via .dev.vars)"
  expect /admin 200
  expect /admin/new 200
else
  echo "admin is confined to the admin hostname"
  expect /admin 404
  expect /admin/dashboard 404
fi

echo "redirects"
expect /blogs 308

echo "content assertions"
# Proves D1 was actually read, not that a page merely rendered.
expect_body /projects "CI Fixture (full)"
# Unpublished must be absent from the listing as well as unreachable.
if curl -s --max-time 30 "$BASE/projects" | grep -qF -- "CI Fixture (unpublished)"; then
  echo "  FAIL  /projects                    lists an unpublished project"
  FAILED=1
else
  echo "  ok    /projects                    excludes unpublished"
fi
# The markdown body must render as HTML, not leak raw markdown.
expect_body /projects/ci-fixture-full "<h2"
# The bare fixture must show the fallback rather than an empty region.
expect_body /projects/ci-fixture-bare "A longer write-up is coming"
# Blog code blocks are highlighted at build; the CSS variables prove it ran.
expect_body /blog/hello "--shiki-light"
# Proves the MDX element map is wired. If mdx-components.tsx stops being found,
# useMDXComponents never runs, MDX falls back to bare elements, and the build
# still succeeds — the shiki assertion above would keep passing, because those
# variables come from rehype-pretty-code rather than from the map. This class
# is emitted only by markdownComponents.h2.
expect_body /blog/hello "tracking-wider mt-12"

echo "indexability"
expect /robots.txt 200
expect /sitemap.xml 200
# The worker must serve robots itself; without it Cloudflare injects a default
# that neither disallows /admin nor names a sitemap.
expect_body /robots.txt "Disallow: /admin"
expect_body /robots.txt "Sitemap: https://codewithshayy.com/sitemap.xml"
# Dynamic, so it must reflect D1 rather than a build-time snapshot.
expect_body /sitemap.xml "/projects/ci-fixture-full"
# published = 0 must not be advertised to crawlers.
if curl -s --max-time 30 "$BASE/sitemap.xml" | grep -qF -- "ci-fixture-draft"; then
  echo "  FAIL  /sitemap.xml                 lists an unpublished project"
  FAILED=1
else
  echo "  ok    /sitemap.xml                 excludes unpublished"
fi
# Canonical names the apex, so the other two hostnames are not indexed as
# duplicates of it.
expect_body /projects '<link rel="canonical" href="https://codewithshayy.com/projects"'

echo "worker error log"
ERRORS=$(curl -s -X POST "$BASE/cdn-cgi/local/explorer/api/local/observability/query" \
  -H 'Content-Type: application/json' \
  -d '{"sql":"SELECT count(*) FROM logs WHERE level=\"error\" AND ts_ms > '"$STARTED_MS"'"}' 2>/dev/null \
  | grep -oE '\[\[[0-9]+\]\]' | grep -oE '[0-9]+' | head -1)
ERRORS="${ERRORS:-0}"
if [[ "$ERRORS" == "0" ]]; then
  echo "  ok    no errors in the observability store"
else
  echo "  FAIL  $ERRORS error(s) logged by the worker:"
  curl -s -X POST "$BASE/cdn-cgi/local/explorer/api/local/observability/query" \
    -H 'Content-Type: application/json' \
    -d '{"sql":"SELECT substr(message,1,300) FROM logs WHERE level=\"error\" AND ts_ms > '"$STARTED_MS"' ORDER BY ts_ms DESC LIMIT 5"}' 2>/dev/null
  FAILED=1
fi

[[ "$FAILED" == "0" ]] && echo "smoke: pass" || echo "::error::smoke: fail"
exit "$FAILED"
