# Verification agents

Four agents, one per failure mode observed in this repository. They are not a
generic reviewer roster — each maps to specific incidents, and the prompts carry
those incidents as checklists.

| agent | trigger | exists because |
|---|---|---|
| `measurement-check` | before reporting a measured number as fact | seven wrong conclusions came from instruments answering a different question |
| `release-verify` | after a deploy or D1/R2 migration | a migration blanked every page's copy while all routes returned 200 |
| `invariant-audit` | before opening a PR | a media delete guard checked one table of two; a partial settings row emptied the site |
| `doc-truth` | after editing `AGENTS.md` or `.claude/rules/` | a false claim in these docs was used to justify a code decision |

## Registration

A new `.claude/agents/` directory is not picked up mid-session. Restart Claude
Code, then confirm with `/agents` that all four appear.

## Pending verification

These agents were written but **not yet exercised**, because they could not be
invoked in the session that created them. Each needs its negative test before it
should be trusted — an agent that passes what it should reject is worse than no
agent.

- [ ] `measurement-check`: feed it the real case — `grep -c '<article'` against a
      saved copy of the live `/projects`, which reports 1 where the answer is 6.
      It must return `unsupported` and name the method it substituted. The trap
      only exists against **minified** HTML; against a pretty-printed fixture both
      methods agree and it would pass for the wrong reason.
- [ ] `release-verify`: reproduce a partial settings row locally — delete the row,
      upload an image as the first action — and confirm it fails rather than
      passing on the 200s.
- [ ] `invariant-audit`: remove `force-dynamic` from a D1 route and confirm it is
      reported. Revert.
- [ ] `doc-truth`: seed a false claim in a rule and confirm it is caught.

Tick these off in this file as they pass.
