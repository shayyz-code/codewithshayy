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
# It boots the *existing* bundle and never builds one. Editing next.config.mjs
# or any source file and running this again therefore tests the previous build
# and reports it as a pass — which is how a deliberately broken config was
# measured as fixed here once. Rebuild first, or run `pnpm preview`, which does.
#
# It boots the worker twice, on [port] and [port]+1. The admin bypass is read at
# boot, and the two things worth asserting need opposite settings: with it off
# /admin must 404, since the admin belongs to one hostname; with it on the
# upload actions are reachable at all. Passing `--var ADMIN_LOCAL_BYPASS:<n>`
# decides it, and that beats .dev.vars, so both phases run in CI and locally.
#
# Which branch ran used to depend on whether .dev.vars existed. CI has none, so
# it never ran a single upload assertion — deleting the experimental block from
# next.config.mjs, the defect they were written for, shipped green.
#
# Usage: scripts/smoke.sh [port]

set -uo pipefail

PORT="${1:-8788}"
BASE=""
LOG=$(mktemp)
FAILED=0
PREVIEW_PID=""
# The observability store lives in .wrangler/ and survives restarts, so any
# query here must be time-bounded or it reports an earlier run's errors. This
# check read 432 stale rows before it was bounded. boot resets it, so each
# phase only ever answers for its own worker.
STARTED_MS=$(( $(date +%s) * 1000 ))

cleanup() {
  [[ -n "${PREVIEW_PID:-}" ]] && kill "$PREVIEW_PID" 2>/dev/null
  pkill -f "wrangler dev" 2>/dev/null
  pkill -f workerd 2>/dev/null
  return 0
}
trap cleanup EXIT

# boot <port> <bypass 0|1>
#
# --var overrides .dev.vars, which is the whole reason both phases can run in
# either environment. Measured rather than assumed: booted with
# ADMIN_LOCAL_BYPASS:0 while .dev.vars said 1, and /admin came back 404 with
# /privacy still 200 — so the override took and the worker was alive to answer.
boot() {
  local port="$1" bypass="$2"
  BASE="http://localhost:$port"
  STARTED_MS=$(( $(date +%s) * 1000 ))

  echo "booting worker on :$port (ADMIN_LOCAL_BYPASS=$bypass)"
  npx opennextjs-cloudflare preview --port "$port" \
    --var "ADMIN_LOCAL_BYPASS:$bypass" >"$LOG" 2>&1 &
  PREVIEW_PID=$!

  for _ in $(seq 1 60); do
    sleep 2
    curl -sf -o /dev/null "$BASE/privacy" 2>/dev/null && break
  done

  if ! curl -sf -o /dev/null "$BASE/privacy" 2>/dev/null; then
    echo "::error::worker never became ready on :$port"
    tail -30 "$LOG"
    exit 1
  fi
}

shutdown() {
  # Anything the worker logs on its way down lands after the phase's error
  # check and before the next boot resets STARTED_MS, so it is attributed to
  # neither phase. Nothing has turned up in that window yet.
  cleanup
  PREVIEW_PID=""
  # The next phase binds a different port, so this is not about the port being
  # free — it is about the old instance no longer answering on it.
  sleep 3
}

boot "$PORT" 0

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

# The worker logs errors nowhere else: they never reach stdout, only the local
# observability store. Called once per phase, against that phase's worker and
# bounded by that phase's start, because the store is shared on disk and a
# single query at the end would silently drop everything phase one logged.
error_log_check() {
  local raw errors
  raw=$(curl -s --max-time 30 -X POST "$BASE/cdn-cgi/local/explorer/api/local/observability/query" \
    -H 'Content-Type: application/json' \
    -d '{"sql":"SELECT count(*) FROM logs WHERE level=\"error\" AND ts_ms > '"$STARTED_MS"'"}' 2>/dev/null)
  errors=$(grep -oE '\[\[[0-9]+\]\]' <<<"$raw" | grep -oE '[0-9]+' | head -1)

  # This defaulted an empty result to 0 and printed ok. A dead port, a wrong
  # $BASE and a changed response shape all produce an empty result, and running
  # the old pipeline against a closed port did print "no errors". The store is
  # the only place a worker error appears at all — `Body exceeded 1 MB limit.`
  # reached no page and no stdout — so a check that cannot read it has taken no
  # measurement, and must not report a pass.
  if [[ -z "$errors" ]]; then
    echo "  FAIL  observability store unreadable; errors not measured"
    printf '        got (first 200 chars): %s\n' "$(tr -d '\n' <<<"$raw" | cut -c1-200)"
    FAILED=1
    return
  fi

  if [[ "$errors" == "0" ]]; then
    echo "  ok    no errors in the observability store"
  else
    echo "  FAIL  $errors error(s) logged by the worker:"
    curl -s -X POST "$BASE/cdn-cgi/local/explorer/api/local/observability/query" \
      -H 'Content-Type: application/json' \
      -d '{"sql":"SELECT substr(message,1,300) FROM logs WHERE level=\"error\" AND ts_ms > '"$STARTED_MS"' ORDER BY ts_ms DESC LIMIT 5"}' 2>/dev/null
    FAILED=1
  fi
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

# Wrangler pins the request host to the first configured route, so every
# request under preview arrives as codewithshayy.com — which is not the admin
# host, and with the bypass off that is what /admin must 404 on. This used to
# read .dev.vars and assert whichever answer that implied: real in CI, absent
# locally, and never in the same run as the upload block below.
#
# Both paths have to be ones that 200 with the bypass on, or they are not
# measuring confinement. /admin/dashboard was here and is not such a path — it
# routes to /admin/[id], which notFound()s on a missing project, so it returns
# 404 either way. /admin/new is asserted 200 in phase two.
echo "admin is confined to the admin hostname"
expect /admin 404
expect /admin/new 404

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

# Every assertion above is a GET, and the upload defect was invisible to all of
# them: the framework rejects an oversized body before the action runs, so a
# 2 MB image failed with "Body exceeded 1 MB limit." in the worker log and
# nothing on the page while every route still returned 200.
#
# Replayed the way a browser without JavaScript submits — the hidden $ACTION
# fields the form already carries, plus the file. The action id changes with
# every build, so it is read out of the page rather than written down here.
#
# Reaching the admin needs the bypass on and asserting it 404s needs it off, so
# this is a second worker rather than a branch — and both now run everywhere.
# Before the kill, so the window it covers ends here. Anything the worker logs
# while shutting down falls between this and phase two's STARTED_MS and is
# attributed to neither.
echo "worker error log (bypass off)"
error_log_check

shutdown
boot "$(( PORT + 1 ))" 1

echo "admin (bypass on)"
expect /admin 200
expect /admin/new 200

# One guard rather than a wall of identical failures: everything below posts to
# /admin/ci-bare, so if the bypass did not take, every assertion fails for the
# same reason and none of them measures what it claims to. A skip is the thing
# being fixed here, so this fails loudly instead.
if [[ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 30 "$BASE/admin/ci-bare")" == "200" ]]; then
  echo "admin image upload"

  # ci-bare is seeded with media_key NULL and this block ends by removing what
  # it uploads, so D1 and R2 finish where they started and a second run
  # asserts the same thing as the first. Generated rather than committed:
  # incompressible pixels, so the file is the size the name claims, and the
  # repo stays free of an 8 MB pair of fixtures.
  FIXTURES=$(mktemp -d)
  python3 - "$FIXTURES" <<'PY'
import os, struct, sys, zlib

def png(path, side):
    raw = bytearray()
    for _ in range(side):
        raw.append(0)                       # filter type 0
        raw.extend(os.urandom(side * 3))
    def chunk(tag, data):
        body = tag + data
        return struct.pack(">I", len(data)) + body + struct.pack(
            ">I", zlib.crc32(body) & 0xFFFFFFFF)
    out = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", side, side, 8, 2, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(bytes(raw), 0))
           + chunk(b"IEND", b""))
    open(path, "wb").write(out)

png(sys.argv[1] + "/ok.png", 840)        # ~2.0 MB: over the old framework
                                         # limit, under the app's own
png(sys.argv[1] + "/toobig.png", 1450)   # ~6.0 MB: over both
PY

  # The hidden fields of the form holding the file input, in document order.
  action_fields() {
    curl -s --max-time 30 "$BASE$1" | python3 -c '
import sys, re, html
doc = sys.stdin.read()
for form in re.findall(r"<form[^>]*>.*?</form>", doc, re.S):
    if "name=\"image\"" in form:
        for inp in re.findall(r"<input[^>]*type=\"hidden\"[^>]*>", form):
            name = re.search(r"name=\"([^\"]+)\"", inp).group(1)
            value = re.search(r"value=\"([^\"]*)\"", inp)
            print(name + "=" + (html.unescape(value.group(1)) if value else ""))
        break
'
  }

  # submit_upload <path> <file> — prints "<status> <location>". A missing form
  # prints 000, which is no measurement rather than a failed one.
  submit_upload() {
    local path="$1" file="$2" args=() field out
    while IFS= read -r field; do
      [[ -n "$field" ]] && args+=(-F "$field")
    done < <(action_fields "$path")

    if [[ ${#args[@]} -eq 0 ]]; then
      echo "000 no-action-fields-in-page"
      return
    fi

    out=$(curl -s -o /dev/null -D - -w 'HTTPCODE=%{http_code}' --max-time 60 \
      -X POST "$BASE$path" "${args[@]}" -F "image=@$file;type=image/png")
    printf '%s %s\n' \
      "$(grep -o 'HTTPCODE=[0-9]*' <<<"$out" | cut -d= -f2)" \
      "$(grep -i '^location:' <<<"$out" | tr -d '\r' | sed 's/^[Ll]ocation: *//')"
  }

  # media_key <path> — the R2 key the edit page is currently showing.
  media_key() {
    curl -s --max-time 30 "$BASE$1" | grep -oE 'projects/[a-z0-9-]+\.(png|jpg|webp|avif|gif)' | head -1
  }

  # The Location matters as much as the status. A rejected upload redirects
  # with 303 too, and setMediaKey runs before the revalidatePath calls inside
  # the same try — so a throw in that tail would store the key, report the
  # failure, and satisfy a check that only looked at "303 and a key exists".
  read -r STATUS LOCATION <<<"$(submit_upload /admin/ci-bare "$FIXTURES/ok.png")"
  KEY=$(media_key /admin/ci-bare)
  if [[ "$STATUS" == "303" && "$LOCATION" == "/admin/ci-bare" && -n "$KEY" ]]; then
    echo "  ok    /admin/ci-bare               2 MB upload stored as $KEY"
  else
    echo "  FAIL  /admin/ci-bare               2 MB upload got $STATUS -> '$LOCATION', key '$KEY'"
    FAILED=1
  fi

  # The object has to come back whole. A stored-but-truncated upload would
  # leave the key above looking perfectly correct.
  if [[ -n "$KEY" ]]; then
    BYTES=$(curl -s -o /dev/null -w '%{size_download}' --max-time 30 "$BASE/media/$KEY")
    WANT=$(wc -c <"$FIXTURES/ok.png" | tr -d ' ')
    if [[ "$BYTES" == "$WANT" ]]; then
      echo "  ok    /media/$KEY  serves all $BYTES bytes"
    else
      echo "  FAIL  /media/$KEY  served $BYTES bytes, stored $WANT"
      FAILED=1
    fi
  fi

  # Over the app's limit: the app's own message must be what comes back, not a
  # bare 500. Every string putMedia raises was unreachable from the browser
  # before the actions caught them.
  read -r STATUS LOCATION <<<"$(submit_upload /admin/ci-bare "$FIXTURES/toobig.png")"
  if [[ "$STATUS" == "303" && "$LOCATION" == *"error=image+is+6.0+MB"* ]]; then
    echo "  ok    /admin/ci-bare               6 MB upload refused, with the reason"
  else
    echo "  FAIL  /admin/ci-bare               6 MB upload got $STATUS -> '$LOCATION'"
    FAILED=1
  fi

  # Both remaining checks compare against $KEY, so with nothing stored they
  # compare empty to empty and pass without measuring anything. That is how a
  # dead assertion looks from the outside, and this block reported two of them
  # before the negative test ran: the first upload failing made the next three
  # lines green. An unmeasured check says so rather than claiming ok.
  if [[ -z "$KEY" ]]; then
    echo "  ---   /admin/ci-bare               nothing stored, remaining checks not measured"
  else
    if [[ "$(media_key /admin/ci-bare)" == "$KEY" ]]; then
      echo "  ok    /admin/ci-bare               refused upload left the image alone"
    else
      echo "  FAIL  /admin/ci-bare               refused upload changed the key"
      FAILED=1
    fi
  fi

  # Restores the fixture. Also the only coverage removeMediaAction has, and it
  # deletes the R2 object too, since nothing else references the key.
  REMOVE=$(curl -s --max-time 30 "$BASE/admin/ci-bare" | python3 -c '
import sys, re, html
doc = sys.stdin.read()
for form in re.findall(r"<form[^>]*>.*?</form>", doc, re.S):
    if "Remove image" in form:
        for inp in re.findall(r"<input[^>]*type=\"hidden\"[^>]*>", form):
            name = re.search(r"name=\"([^\"]+)\"", inp).group(1)
            value = re.search(r"value=\"([^\"]*)\"", inp)
            print(name + "=" + (html.unescape(value.group(1)) if value else ""))
        break
')
  RM_ARGS=()
  while IFS= read -r field; do
    [[ -n "$field" ]] && RM_ARGS+=(-F "$field")
  done <<<"$REMOVE"
  [[ ${#RM_ARGS[@]} -gt 0 ]] &&
    curl -s -o /dev/null --max-time 30 -X POST "$BASE/admin/ci-bare" "${RM_ARGS[@]}"

  if [[ -z "$KEY" ]]; then
    :
  elif [[ -z "$(media_key /admin/ci-bare)" ]]; then
    echo "  ok    /admin/ci-bare               image removed, fixture back to NULL"
    # D1 being clean says nothing about R2, and an orphan there would never
    # surface on its own: the fixture is random bytes, so every run hashes to a
    # different key and no later run can collide with one left behind.
    expect "/media/$KEY" 404
  else
    echo "  FAIL  /admin/ci-bare               image not removed; D1 left dirty"
    FAILED=1
  fi

  rm -rf "$FIXTURES"

  # ------------------------------------------------------------------ #
  # The write boundary rejects a scheme that would execute on click.
  #
  # siteUrl and repoUrl are stored once and rendered as an href in four
  # places — the card, the detail page, the JSON API and the JSON-LD — so
  # the check belongs at the write, and this is what proves it is there.
  #
  # Two assertions, not one. That it is refused is half: a server action that
  # throws reaches src/app/error.tsx with the message stripped in production,
  # so an admin would see a blank 500 and no reason. The message has to come
  # back on the form, which is what ?error=&field=form carries.
  echo "admin write boundary"

  # Hidden fields of the form holding the slug input — the main project form,
  # as opposed to the image form action_fields() finds.
  form_fields() {
    curl -s --max-time 30 "$BASE$1" | python3 -c '
import sys, re, html
doc = sys.stdin.read()
for form in re.findall(r"<form[^>]*>.*?</form>", doc, re.S):
    if "name=\"slug\"" in form:
        for inp in re.findall(r"<input[^>]*type=\"hidden\"[^>]*>", form):
            name = re.search(r"name=\"([^\"]+)\"", inp).group(1)
            value = re.search(r"value=\"([^\"]*)\"", inp)
            print(name + "=" + (html.unescape(value.group(1)) if value else ""))
        break
'
  }

  FORM_ARGS=()
  while IFS= read -r field; do
    [[ -n "$field" ]] && FORM_ARGS+=(-F "$field")
  done < <(form_fields /admin/ci-bare)

  if [[ ${#FORM_ARGS[@]} -eq 0 ]]; then
    echo "  FAIL  /admin/ci-bare               no action fields; nothing measured"
    FAILED=1
  else
    # The whole row as the API projects it, before anything is written. The
    # restore below replays a fixed set of fields, so it round-trips only while
    # ci-bare's other columns stay NULL and it has no tags. Comparing the row to
    # itself afterwards makes that a checked assumption instead of a standing
    # bet: give the fixture a role, a year, a body or a tag and this fails
    # loudly rather than quietly clearing it. The projection carries no
    # timestamp, so a byte comparison is stable.
    BARE_BEFORE=$(curl -s --max-time 30 "$BASE/api/v1/projects/ci-fixture-bare")

    XSS=$(curl -s -o /dev/null -D - -w 'HTTPCODE=%{http_code}' --max-time 30 \
      -X POST "$BASE/admin/ci-bare" "${FORM_ARGS[@]}" \
      -F "slug=ci-fixture-bare" \
      -F "title=CI Fixture (bare)" \
      -F "description=Nullable columns are all NULL, so nothing should render a dead link." \
      -F "siteUrl=javascript:alert(1)" \
      -F "published=on" 2>/dev/null | tr -d '\r')

    LOC=$(sed -n 's/^[Ll]ocation: //p' <<<"$XSS" | tail -1)

    # A successful save redirects to /admin. Anything landing there means the
    # javascript: URL was written.
    if [[ "$LOC" == *"/admin/ci-bare"*"error="* ]]; then
      echo "  ok    /admin/ci-bare               javascript: URL refused"
    else
      echo "  FAIL  /admin/ci-bare               javascript: URL was accepted (-> ${LOC:-none})"
      FAILED=1
    fi

    # And the reason is legible rather than a blank 500. Fetch the page the
    # action actually redirected to, not a hand-written approximation of it —
    # an assertion against a URL this script composed would pass even if the
    # action redirected somewhere else entirely.
    #
    # Location may be absolute or path-only depending on how Next builds it, so
    # normalise rather than assuming. An earlier version did
    # "$BASE${LOC#*://*/}", which drops the leading slash and yields
    # localhost:8788admin/... — that curl fails, and the check fell through to
    # a synthetic URL and passed without ever reading the redirect.
    case "$LOC" in
      http*) ERR_URL="$LOC" ;;
      /*)    ERR_URL="$BASE$LOC" ;;
      *)     ERR_URL="$BASE/$LOC" ;;
    esac

    if [[ -z "$LOC" ]]; then
      echo "  FAIL  /admin/ci-bare               no Location; nothing to follow"
      FAILED=1
    elif curl -s --max-time 30 "$ERR_URL" | grep -qF 'role="alert"'; then
      echo "  ok    /admin/ci-bare               the refusal renders on the form"
    else
      echo "  FAIL  /admin/ci-bare               ?error is not rendered; a blank 500"
      FAILED=1
    fi

    # The row must be untouched — a rejected save is not a partial save.
    if curl -s --max-time 30 "$BASE/api/v1/projects/ci-fixture-bare" \
         | grep -qF 'javascript:'; then
      echo "  FAIL  /api/v1/projects            a javascript: URL reached the API"
      FAILED=1
    else
      echo "  ok    /api/v1/projects            no javascript: URL stored"
    fi

    # Restore, the way the upload block does: a run that fails must still
    # leave D1 where it started, or the next one measures the wreckage of the
    # last. An empty siteUrl is NULL, which is what the fixture holds. This is
    # a no-op on a passing run — nothing was written.
    curl -s -o /dev/null --max-time 30 -X POST "$BASE/admin/ci-bare" \
      "${FORM_ARGS[@]}" \
      -F "slug=ci-fixture-bare" \
      -F "title=CI Fixture (bare)" \
      -F "description=Nullable columns are all NULL, so nothing should render a dead link." \
      -F "siteUrl=" \
      -F "published=on" 2>/dev/null

    BARE_AFTER=$(curl -s --max-time 30 "$BASE/api/v1/projects/ci-fixture-bare")
    if [[ "$BARE_BEFORE" == "$BARE_AFTER" ]]; then
      echo "  ok    /admin/ci-bare               the fixture is back as it was"
    else
      echo "  FAIL  /admin/ci-bare               the restore did not round-trip"
      echo "        before: $BARE_BEFORE"
      echo "        after:  $BARE_AFTER"
      FAILED=1
    fi
  fi
else
  echo "::error::admin unreachable with the bypass on; no upload assertion ran"
  FAILED=1
fi

echo "worker error log (bypass on)"
error_log_check

[[ "$FAILED" == "0" ]] && echo "smoke: pass" || echo "::error::smoke: fail"
exit "$FAILED"
