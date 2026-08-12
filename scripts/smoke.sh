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
for p in / /me /projects /blog /blog/hello /rss.xml /privacy /terms /docs \
         /openapi.json /api/v1/projects /api/v1/posts \
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
# Settings-driven copy actually renders. A settings row that exists but is
# missing columns is authoritative and blank, which once took the hero, bio and
# contact block off the live site while every route still returned 200 — status
# codes alone do not catch it.
expect_body / "Stop Scrolling"
expect_body /me "Software Engineer"

# Blog code blocks are highlighted at build; the CSS variables prove it ran.
expect_body /blog/hello "--shiki-light"
# Proves the MDX element map is wired. If mdx-components.tsx stops being found,
# useMDXComponents never runs, MDX falls back to bare elements, and the build
# still succeeds — the shiki assertion above would keep passing, because those
# variables come from rehype-pretty-code rather than from the map. This class
# is emitted only by markdownComponents.h2.
expect_body /blog/hello "tracking-wider mt-12"

echo "json api"
expect /openapi.json 200
expect /docs 200
# /docs exists to render the spec, and a page that emits its chrome with no
# endpoints returns 200 all the same. Assert something only the spec supplies.
expect_body /docs "/api/v1/projects"
expect /api/v1/projects 200
expect /api/v1/posts 200
# Proves D1 was read, not merely that JSON was emitted.
expect_body /api/v1/projects '"slug": "ci-fixture-full"'
# Unpublished must be absent from the API exactly as it is from the listing.
if curl -s --max-time 30 "$BASE/api/v1/projects" | grep -qF -- "ci-fixture-draft"; then
  echo "  FAIL  /api/v1/projects            exposes an unpublished project"
  FAILED=1
else
  echo "  ok    /api/v1/projects            excludes unpublished"
fi
# A missing record is a 404 with a body, never 200 carrying null.
expect /api/v1/projects/does-not-exist 404
expect /api/v1/projects/ci-fixture-draft 404
expect /api/v1/posts/does-not-exist 404
expect_body /api/v1/projects/does-not-exist '"error": "not_found"'
# The row id is the D1 primary key and is deliberately not published.
if curl -s --max-time 30 "$BASE/api/v1/projects" | grep -qE '"id"[[:space:]]*:'; then
  echo "  FAIL  /api/v1/projects            leaks the row id"
  FAILED=1
else
  echo "  ok    /api/v1/projects            omits the row id"
fi
# Media keys are meaningless off-origin, so the API publishes absolute URLs.
# Both fields, because they are built differently: `url` is unconditional string
# concatenation, while `image` is the one branching transform in the API —
# rooted paths pass through, everything else is an R2 key. Asserting only `url`
# leaves that branch free to regress to bare keys with every check still green.
expect_body /api/v1/projects/ci-fixture-full '"url": "https://codewithshayy.com/projects/ci-fixture-full"'
expect_body /api/v1/projects/ci-fixture-full '"image": "https://codewithshayy.com/media/projects/ci-fixture.png"'
# Declared so a browser on another origin can consume it.
if curl -s -I --max-time 30 "$BASE/api/v1/projects" | grep -qi 'access-control-allow-origin: \*'; then
  echo "  ok    /api/v1/projects            allows cross-origin reads"
else
  echo "  FAIL  /api/v1/projects            missing access-control-allow-origin"
  FAILED=1
fi

# Every path the spec documents must actually respond. This is what keeps a
# hand-maintained spec honest: adding a path to spec.ts without a route handler
# fails here rather than shipping a lie. {slug} is substituted with a fixture
# that exists, since the placeholder itself is not a real record.
echo "  ---   every documented path responds"
DOCUMENTED=$(curl -s --max-time 30 "$BASE/openapi.json" \
  | grep -oE '"/api/v1/[a-z{}/]+"' | tr -d '"' | sort -u)
if [[ -z "$DOCUMENTED" ]]; then
  echo "  FAIL  /openapi.json               documents no paths at all"
  FAILED=1
fi
for p in $DOCUMENTED; do
  case "$p" in
    */projects/\{slug\}) probe="/api/v1/projects/ci-fixture-full" ;;
    */posts/\{slug\})    probe="/api/v1/posts/hello" ;;
    *)                   probe="$p" ;;
  esac
  expect "$probe" 200
done

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

echo "metadata and structured data"
# /me had no title of its own, so it was indexed and shared under the same
# title as the home page — the one thing a title exists to distinguish.
expect_body /me "<title>About — Code w/ Shayy</title>"
# A route's openGraph replaces the layout's rather than merging, so a post
# without a cover image shipped with no og:image at all. The fallback is the
# logo; asserting the tag is present is what stops that regressing silently.
expect_body /blog/hello '<meta property="og:image"'
expect_body /projects/ci-fixture-full '<meta property="og:image"'
# JSON-LD renders, and the identity is shared rather than reinvented per page:
# the author of a post is an @id reference to the Person emitted on / and /me.
expect_body / '"@type":"WebSite"'
expect_body /me '"@type":"Person"'
expect_body /blog/hello '"@type":"BlogPosting"'
expect_body /projects/ci-fixture-full '"@type":"CreativeWork"'
expect_body /blog/hello '"@type":"BreadcrumbList"'
expect_body /blog/hello '"author":{"@id":"https://codewithshayy.com/me#person"}'
# The escaping in json-ld.tsx exists so a "</script>" in admin-authored copy
# cannot close the block early. seeds/ci.sql puts one in this fixture's
# description precisely so this can fail.
#
# Extracting the block is the whole difficulty. The HTML is minified onto a
# handful of lines, so a greedy match runs past the block's own closing tag and
# swallows the rest of the document — an earlier version of this check did
# exactly that and reported a breakout that was the terminator working
# correctly. Hence a non-greedy extract, then a real JSON parse: if the escape
# ever fails, the block truncates at the injected tag and stops being JSON.
LDJSON=$(curl -s -w '\n%{http_code}' --max-time 30 "$BASE/projects/ci-fixture-full")
if [[ "$(tail -1 <<<"$LDJSON")" != "200" ]]; then
  echo "  FAIL  /projects/ci-fixture-full   no response, JSON-LD not measured"
  FAILED=1
else
  if sed '$d' <<<"$LDJSON" | python3 -c '
import sys, re, json
html = sys.stdin.read()
blocks = re.findall(r"<script type=\"application/ld\+json\">(.*?)</script>", html, re.S)
if not blocks:
    sys.exit("no ld+json block found")
for b in blocks:
    json.loads(b)
    if "<" in b:
        sys.exit("raw < survived escaping")
if "u003c/script" not in "".join(blocks):
    sys.exit("fixture no longer carries markup; this check is vacuous")
' 2>/dev/null; then
    echo "  ok    /projects/ci-fixture-full   JSON-LD parses, markup escaped"
  else
    echo "  FAIL  /projects/ci-fixture-full   JSON-LD invalid or unescaped:"
    sed '$d' <<<"$LDJSON" | python3 -c '
import sys, re, json
html = sys.stdin.read()
blocks = re.findall(r"<script type=\"application/ld\+json\">(.*?)</script>", html, re.S)
print("        blocks found:", len(blocks))
for b in blocks:
    try:
        json.loads(b)
    except Exception as e:
        print("        parse error:", e)
    print("        raw < present:", "<" in b)
' 2>&1 | head -6
    FAILED=1
  fi
fi
# The docs page is only findable if it is advertised.
expect_body /sitemap.xml "/docs"

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
