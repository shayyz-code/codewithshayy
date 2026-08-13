import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"
import createMDX from "@next/mdx"

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Drops the x-powered-by: Next.js response header. Version fingerprinting is
  // free reconnaissance on a public site.
  poweredByHeader: false,
  images: {
    // R2 media is resized by the /media route through the IMAGES binding.
    // See image-loader.ts for why /_next/image cannot do it here.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  experimental: {
    serverActions: {
      // Deliberately above putMedia's MAX_BYTES of 5 MB rather than equal to
      // it. Whichever limit is lower is the one that fires, and this one has
      // no message: Next rejects the request before the action body runs, so
      // it surfaces as a bare 500 with nothing on the page. The default is
      // 1 MB, so a 2 MB upload against a form advertising 5 MB failed with
      // "Body exceeded 1 MB limit." in the worker log and silence in the
      // browser. Keeping this above the app limit is what lets putMedia's own
      // message be the one an admin actually sees.
      //
      // The gap is real rather than a byte because multipart overhead makes
      // the body larger than the file it carries.
      bodySizeLimit: "8mb",
    },
  },
  async redirects() {
    return [
      // /blogs used to render the courses page. Keep the old URL alive.
      { source: "/blogs", destination: "/blog", permanent: true },
      { source: "/blogs/:slug", destination: "/blog/:slug", permanent: true },
    ]
  },
}

const withMDX = createMDX({
  options: {
    // Plugins are named as strings, not imported. Turbopack serialises loader
    // options and rejects function references outright:
    //   "loader ... does not have serializable options"
    remarkPlugins: [
      "remark-frontmatter",
      // Exposes the YAML block as a named `frontmatter` export.
      ["remark-mdx-frontmatter", { name: "frontmatter" }],
    ],
    rehypePlugins: [
      [
        "rehype-pretty-code",
        {
          // Paired themes: both are emitted and CSS picks one, so highlighting
          // works in either mode without re-running at request time.
          theme: { light: "github-light", dark: "github-dark" },
          keepBackground: false,
        },
      ],
    ],
  },
})

// Makes Cloudflare bindings available during `next dev`. Guarded, because it
// starts miniflare — a production build has no use for that, and it made the
// build depend on wrangler state that CI does not have.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev()
}

export default withMDX(nextConfig)
