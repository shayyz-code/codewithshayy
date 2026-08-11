import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Firebase Storage still holds the project images. Removed once the
      // migration has copied them into R2 and rewritten the rows.
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/v0/b/minicoders-bff8f.appspot.com/**",
      },
    ],
  },
}

// Makes Cloudflare bindings available during `next dev`.
initOpenNextCloudflareForDev()

export default nextConfig
