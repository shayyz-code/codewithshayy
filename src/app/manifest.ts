import type { MetadataRoute } from "next"

// Replaces public/site.webmanifest, which was linked from nothing and carried
// empty name and short_name fields. As a route, Next links it from <head>
// automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Code w/ Shayy",
    short_name: "Code w/ Shayy",
    description:
      "Software engineer. I build things with Rust, Go and TypeScript — and write about it.",
    start_url: "/",
    display: "standalone",
    // The old file claimed #ffffff for both while the site renders black.
    background_color: "#000000",
    theme_color: "#0055ff",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
