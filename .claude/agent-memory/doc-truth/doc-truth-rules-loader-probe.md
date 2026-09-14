---
name: doc-truth-rules-loader-probe
description: How to verify claims about how Claude Code loads .claude/rules paths (bare names, depth, gitignored dirs) — the instrument that works (session transcript attachments) and two that do not (stream-json grep, model's own timing report)
metadata:
  type: reference
---

`.claude/rules/runtimes.md` (from `d0bf6d6`) cites a loader measurement. Checked
2026-09-14 on Claude Code **2.1.270**; re-check when the version moves.

**The instrument that answers the question** is the headless session's on-disk
transcript, not its stdout:

```bash
D=~/.claude/projects/<cwd with / replaced by ->   # slug of the probe dir
jq -c 'select(.type=="attachment" and (.attachment.type=="nested_memory" or .attachment.type=="instructions"))
       | {ts:.timestamp, p:(.attachment.path // .attachment.files[0].path), globs:.attachment.content.globs}' $D/<session_id>.jsonl
```

A path-scoped rule arrives as a `nested_memory` attachment carrying its
`globs`; an unscoped rule arrives as `instructions` at session start. The
`session_id` is in the `system/init` event of the `stream-json` output.

**Two instruments that look right and are not:**

- **grepping `--output-format stream-json` for rule text.** Zero hits for rules
  that demonstrably loaded — neither `instructions` nor `nested_memory`
  attachments are emitted to that stream. Markers appear only where the model
  types them.
- **asking the model when a marker arrived.** In a 2026-09-14 re-run every
  `nested_memory` attachment landed at one timestamp after the fifth Read, yet
  the model attributed each marker to "after reading <its file>". Whether a
  marker was seen is trustworthy (random tokens, Read calls audited, negative
  control absent); *when* is confabulated.

**Measured at 2.1.270** (probe: one rule per pattern with a random marker, a
never-read negative control, an unscoped positive control, `--allowedTools Read`):
bare `x.json` matches at root, depth 1 and depth 2 (`a/b/`); `**/x.json` matches
at root; bare `x.json` matches inside a `.gitignore`d directory (`ignored/`), and bare
`package.json` matches `node_modules/pkg/package.json` (ignored via
`.gitignore`). Negative control never loaded. Consequence for this repo:
reading any build-output `package.json` (`.next/`, `.open-next/`,
`node_modules/`) loads `runtimes.md`.

**Why:** the doc's first measurement attempt used the stream-json grep and got a
false "nothing loads"; a positive control exposed it. Same family as the
`measurement-check` failures — an instrument answering a different question.

**How to apply:** for any claim about rule/memory loading, build a throwaway
repo in the scratchpad (fresh copy, new markers), run
`claude -p --model haiku --allowedTools Read --output-format stream-json --verbose "<prompt>" </dev/null`,
then read the transcript attachments. See [[doc-truth-third-party-pins]],
[[doc-truth-rot-hotspots]].
