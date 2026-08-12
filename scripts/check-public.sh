#!/usr/bin/env bash
# Fails if public/ holds anything git does not track.
#
# The build copies this directory wholesale into the deployed assets, so a local
# file that git never sees still ships. That is how .DS_Store ended up served at
# 200 on the live site.
#
# --ignored is the point: .DS_Store is *ignored*, not untracked, so it shows as
# `!!` rather than `??`. A check that only looked for `??` would miss the exact
# file that motivated this.
set -euo pipefail
cd "$(dirname "$0")/.."

stray=$(git status --porcelain --ignored -- public/ | grep -E '^(\?\?|!!) ' || true)

if [[ -n "$stray" ]]; then
  echo "::error::public/ contains files git does not track — these would be deployed:"
  printf '%s\n' "$stray" | sed 's/^/  /'
  echo "Delete them, or track them if they belong in the build."
  exit 1
fi
