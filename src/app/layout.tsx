import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { Kanit } from "next/font/google"
import "./globals.css"
import Navigation from "@/ui/Navigation/Navigation"
import Footer from "@/ui/Footer/Footer"

const fontBurbankBlack = Kanit({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-burbankblack",
})

const fontBurbankMedium = Kanit({
  weight: "200",
  subsets: ["latin"],
  variable: "--font-burbankmedium",
})

export const metadata: Metadata = {
  title: "Code w/ Shayy",
  metadataBase: new URL("https://codewithshayy.com"),
  description: "Software engineer. I build things with Rust, Go and TypeScript — and write about it.",
  keywords:
    "Shayy, Aung Min Khant, software engineer, portfolio, Rust, Go, TypeScript, React, Next.js, Myanmar developer",
  authors: [{ name: "Shayy", url: "https://codewithshayy.com/me" }],
  icons: {
    icon: "/favicon.ico", // Path to your favicon
  },
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
        className={`${fontBurbankBlack.variable} ${fontBurbankMedium.variable} overflow-y-scroll overflow-x-hidden`}
      >
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  )
}
