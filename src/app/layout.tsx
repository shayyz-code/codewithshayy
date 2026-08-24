import type { Metadata, Viewport } from "next"
import { Kanit } from "next/font/google"
import "./globals.css"
import Navigation from "@/ui/layout/navigation"
import Footer from "@/ui/layout/footer"
import MotionProvider from "@/ui/layout/motion-provider"

const fontDisplay = Kanit({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-display",
})

const fontBody = Kanit({
  weight: "200",
  subsets: ["latin"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  title: "Code w/ Shayy",
  metadataBase: new URL("https://codewithshayy.com"),
  // Three hostnames serve this worker. Without a canonical, all three are
  // equally eligible to be indexed; relative values resolve against
  // metadataBase, so each route only needs its own path.
  alternates: { canonical: "/" },
  description: "Software engineer. I build things with Rust, Go and TypeScript — and write about it.",
  keywords:
    "Shayy, Aung Min Khant, software engineer, portfolio, Rust, Go, TypeScript, React, Next.js, Myanmar developer",
  authors: [{ name: "Shayy", url: "https://codewithshayy.com/me" }],
  openGraph: {
    type: "website",
    url: "https://codewithshayy.com",
    title: "Code w/ Shayy",
    description: "Software engineer. I build things with Rust, Go and TypeScript — and write about it.",
    images: [
      {
        url: "/logo.webp", // Path to Open Graph image
        width: 512,
        height: 512,
        alt: "Code w/ Shayy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@codewithshayy", // Twitter handle
    title: "Code w/ Shayy",
    description: "Software engineer. I build things with Rust, Go and TypeScript — and write about it.",
    images: ["/logo.webp"], // Path to Twitter image
  },
}

// Replaces the <meta name="viewport"> that was inside a next/head element —
// a no-op in the App Router. maximum-scale/user-scalable are deliberately
// dropped: they blocked pinch-zoom, which people rely on to read.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

// Runs before first paint so the page never flashes light before the stored
// preference is applied. Inlined rather than imported because it has to
// execute ahead of hydration.
const THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("isDarkTheme");
    if (stored === null) { stored = "true"; localStorage.setItem("isDarkTheme", "true"); }
    if (JSON.parse(stored)) document.body.classList.add("dark");
  } catch (e) {}
})();
`

const NOSCRIPT_REVEAL = `
[style*="opacity:0"] {
  opacity: 1 !important;
  transform: none !important;
}
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning because THEME_SCRIPT adds the `dark` class
          before React hydrates, so body's className legitimately differs from
          what the server rendered. Without it React reports a mismatch it
          "won't patch up", which leaves the tree partially hydrated and breaks
          interactivity — server-action forms silently stop submitting. */}
      <body
        suppressHydrationWarning
        className={`${fontDisplay.variable} ${fontBody.variable} overflow-y-scroll overflow-x-hidden`}
      >
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* Every section is a framer-motion client component animating from
            `opacity: 0`, and framer-motion serialises that `initial` state
            into the server-rendered HTML — measured, not inferred:
            .next/server/app/privacy.html ships
            style="opacity:0;transform:translateY(-100px)". With no JS nothing
            ever animates it back, so the page renders blank.

            That is not hypothetical here. .claude/agent-memory records that a
            headless-browser check of /projects would have *confirmed* a false
            "the cards are missing" claim through exactly this mechanism.

            !important because the rule has to beat an inline style. Scoped to
            noscript so it costs nothing when JS runs — and it cannot be a
            plain stylesheet rule either, since with JS the inline value
            changes as the animation runs and the attribute selector would
            stop matching mid-fade. */}
        <noscript>
          <style>{NOSCRIPT_REVEAL}</style>
        </noscript>
        <MotionProvider>
          <Navigation />
          {children}
          <Footer />
        </MotionProvider>
      </body>
    </html>
  )
}
