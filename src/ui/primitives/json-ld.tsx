/**
 * Emits a `<script type="application/ld+json">` block.
 *
 * The CSP is `script-src 'self' 'unsafe-inline'`, and browsers apply `script-src`
 * to `ld+json` blocks even though nothing executes, so the inline allowance is
 * what lets this work at all. A nonce-based policy would have to thread one
 * through here, and the prerendered routes are why there is no nonce — see
 * src/middleware.ts.
 *
 * `<` is escaped rather than trusted. Project titles and descriptions are
 * admin-authored and reach this unfiltered, and a `</script>` inside any string
 * would otherwise close the block and turn the rest of the payload into markup.
 * JSON.stringify does not escape it, because it is valid JSON — the hazard is
 * HTML's, not JSON's.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
