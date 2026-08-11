import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // R2 media is resized by the /media route through the IMAGES binding.
    // See image-loader.ts for why /_next/image cannot do it here.
    loader: "custom",
    loaderFile: "./image-loader.ts",
  },
}

// Makes Cloudflare bindings available during `next dev`.
initOpenNextCloudflareForDev()

export default nextConfig
