// Flat config. `eslint-config-next` ships a native flat-config array as of
// Next 15, so no @eslint/eslintrc FlatCompat shim is needed.
//
// `core-web-vitals` already bundles the base `next` config plus
// `next/typescript`, so importing it alone covers all three.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      // Cloudflare Workers build output + local wrangler state.
      ".open-next/**",
      ".wrangler/**",
      // Generated, and gitignored.
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
]

export default config
