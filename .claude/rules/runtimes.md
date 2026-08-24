---
paths:
  - "wrangler.jsonc"
  - "open-next.config.ts"
  - "package.json"
---

# Runtimes on Workers, so this is not researched twice

Moved here from `AGENTS.md` on 2026-08-24, which had grown past its own
"under 200 lines" target. **The trade is real and is the reason for the move:**
this used to load on every task and now loads only when one of the three files
above is open. Someone asking "could we rewrite this in Rust" with no config
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
`env.rs` exposes `ai`, `analytics_engine`, `assets`, `bucket`, `d1`,
`durable_object`, `dynamic_dispatcher`, `hyperdrive`, `kv`, `queue`,
`rate_limiter`, `secret_store`, `secret`, `send_email`, `service` and `var`,
and no `images()`. An earlier version of this said that issue closing was the
green light for a Rust rewrite, which would have given the wrong answer for a
year. That grep returning non-zero is the signal.

The Containers row is pinned to 2026-08-12 and is the oldest claim here; source
was `developers.cloudflare.com/containers/pricing/`.
