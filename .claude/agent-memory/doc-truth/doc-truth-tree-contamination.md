---
name: doc-truth-tree-contamination
description: How the 2026-08-12 run recorded a false conclusion — it read a working tree that another agent's negative test was mutating underneath it
metadata:
  type: project
---

On 2026-08-12 this agent concluded that `/projects` carries no
`export const dynamic` yet still builds `ƒ`, and therefore that grepping for the
export "gives a false alarm". Every part of that is wrong, and the mechanism is
worth more than the correction.

**What happened.** Two agents ran concurrently in one working directory. A
scratch branch had `force-dynamic` deliberately removed from
`src/app/projects/page.tsx` to negative-test `invariant-audit`. This agent
started while that branch was checked out, *read the file in its seeded state*,
and then — after the branch was reverted and deleted mid-run — ran `pnpm build`
against the restored tree and saw `ƒ /projects`.

Both observations were accurate. The tree changed between them. The reconciliation
was invented: that the export must be redundant.

**Why it is the dangerous shape.** The conclusion did not merely record a wrong
fact, it argued against the check that defends a live invariant — one that, when
violated, bakes the build machine's database into the deploy and serves an empty
`/projects` at 200. A doc that is wrong gets trusted; a doc that is wrong *about
how to verify things* disarms the next reader.

**Why it survived.** Nothing in the method was sloppy. Reading the source and
building are both correct instruments; the error came from assuming the thing
being measured held still. A single-instrument check would have failed the same
way, and re-running either instrument alone would have "confirmed" whichever half
it re-ran.

## How to apply

- **Establish the commit under test, and say so.** Record `git rev-parse HEAD` at
  the start, re-read it at the end, and if the two differ treat every
  source-settled claim as void rather than reconciling them.
- **Prefer `git show <ref>:<path>` over reading the working tree** when checking a
  doc against a specific commit. It cannot be mutated underneath the run.
- **A commit that exists only on a scratch branch is not evidence.** `e08a67a`
  was cited here as though it were project history. It is now unreachable —
  branch deleted — so a later run cannot even inspect what it claimed. Check
  `git branch --contains` before treating a commit as real.
- **When two of your own observations conflict, report the conflict.** Do not
  synthesize a theory that dissolves it. "The file lacks the export but the build
  says dynamic" was the finding; the explanation was not.

Related: [[doc-truth-verified-2026-08-12]], [[doc-truth-rot-hotspots]].
