---
paths:
  - "wrangler.jsonc"
  - "open-next.config.ts"
  - "package.json"
---

# Runtimes on Workers, so this is not researched twice

Moved here from `AGENTS.md` on 2026-08-24, which had reached 199 lines against
its own "under 200" target with more still to land. It had not breached 200 —
the committed maximum is 199 — so the move bought headroom rather than repairing
a violation.

This is the only rule matched on bare filenames — every other one uses a
pattern with a directory in it — so how the loader treats them was measured
rather than assumed. On Claude Code 2.1.270, in a throwaway repo with one rule
per pattern, each carrying a random marker, a headless session read three files
and repeated back the markers that arrived:

| rule `paths:` | file read | loaded |
|---|---|---|
| none | — | at session start (positive control) |
| `"bare-root.json"` | `bare-root.json` | yes |
| `"**/glob-root.json"` | `glob-root.json` | yes |
| `"nested-bare.json"` | `sub/nested-bare.json` | yes |
| `"never-read.json"` | not read | no (negative control) |

A bare filename matches at any depth. A second probe, read from Claude Code's
own session log rather than from the model, found `two-deep.json` loading for
`a/b/two-deep.json`, `in-ignored.json` for a file inside a git-ignored
directory, and `package.json` for `node_modules/pkg/package.json`. So this rule
also loads whenever an agent reads any of the `package.json` files under
`node_modules/`, `.next/` or `.open-next/` — fair times to see it. An earlier
version listed
each file a second time with a `**/` prefix as insurance against a bare name
not matching; the measurement above makes that redundant.

Two instruments give wrong answers here. Grepping `--output-format stream-json`
for the markers finds none, even for rules that loaded — that stream carries no
event for injected rule text. And asking the model *when* a marker arrived
does not work: in the five-file probe every rule attached at the same moment,
after the last Read, while the model reported each one arriving after its own
file. The reliable record is the session log under `~/.claude/projects/`, whose
`attachment` entries name each rule file that was injected. Their timestamps
are per batch, not per file — every rule in that probe carries the same one.

**The trade is real and is the reason for the move:** this used to load on every
task and now loads only when one of those files is open. Someone asking "could we rewrite this in Rust" with no config
file open will not see it. If that happens more than once, move it back and cut
something else instead.

Moving documentation counts as editing it, so the claims below were re-derived
on 2026-08-24 rather than carried across on trust — see the dates inline.

| runtime | status |
|---|---|
| JS / TS, Python, Rust | native |
| **Bun** | cannot run — Workers is workerd/V8, Bun is a separate runtime |
| **Go** | WebAssembly only, via TinyGo |
| Bun or Go natively | only in Containers: Workers Paid, billed per 10ms active, one Durable Object each, scale-to-zero so cold starts |

Rust is the one native option that is not JS, and `workers-rs` covers D1 and R2
— but **not the Images binding**, which `/media` depends on.

Check the capability, not the ticket:

```bash
curl -s https://raw.githubusercontent.com/cloudflare/workers-rs/main/worker/src/env.rs \
  | grep -c 'fn images('     # 0 as of 2026-08-24
```

[workers-rs#717](https://github.com/cloudflare/workers-rs/issues/717) asked for
it and was closed as **completed on 2025-08-04 without the binding arriving** —
`env.rs`'s typed binding accessors are `ai`, `analytics_engine`, `assets`,
`bucket`, `d1`, `durable_object`, `dynamic_dispatcher`, `hyperdrive`, `kv`,
`queue`, `rate_limiter`, `secret_store`, `secret`, `send_email`, `service` and
`var` — alongside the untyped `get_binding` and `object_var`, and no `images()`. An earlier version of this said that issue closing was the
green light for a Rust rewrite, which would have given the wrong answer for a
year. That grep returning non-zero is the signal.

The Containers row is pinned to 2026-08-12 and is the oldest claim here; source
was `developers.cloudflare.com/containers/pricing/`.
