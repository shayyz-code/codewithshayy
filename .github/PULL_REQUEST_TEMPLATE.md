<!--
Write this as a record of the change, not as a message to a reviewer.

  no  "You asked for…", "Your photo was missing", "Say the word and…"
  no  "I nearly shipped…", "my assumption was wrong", "I overstated…"
  yes "public/ held developer.PNG while git tracked developer.png; the
       request 400d."

Keep every measurement, error string and verification result — that is the part
worth having in the history. Recommendations and open questions belong in
conversation, not here.
-->

## What changed

<!-- One or two sentences. What is different now. -->

## Why

<!-- The problem this addresses. Link the issue: Closes #N -->

## Notes

<!--
Anything a future reader would otherwise have to rediscover: a constraint the
runtime imposes, a workaround and the reason for it, an approach that was tried
and did not work. Delete if there is nothing.
-->

## Verification

<!--
What was actually run, and what it returned. Prefer output over adjectives.

  pnpm lint && pnpm typecheck   -> 0
  pnpm preview + scripts/smoke.sh -> 23 assertions pass
  live: /projects 200, 6 cards, 0 broken images
-->
