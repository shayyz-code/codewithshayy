import type { Metadata } from "next"
import localFont from "next/font/local"
import { Kanit } from "next/font/google"
import "./globals.css"
import Navigation from "@/ui/Navigation/Navigation"
import Footer from "@/ui/Footer/Footer"
import { ThemeProvider } from "@/context/themeContext"
import Head from "next/head"

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
  metadataBase: new URL("https://codewithshayy.online"),
  description: "No Filler, Just Code. We offer courses on Coding and Maths.",
  keywords:
    "Web Development, HTML, CSS, JavaScript, TypeScript, React, Next.js, Node.js, coding courses, full stack development, hands-on learning, coding myanmar",
  authors: [{ name: "Shayy", url: "https://codewithshayy.online/me" }],
  icons: {
    icon: "/favicon.ico", // Path to your favicon
  },
  openGraph: {
    type: "website",
    url: "https://codewithshayy.online",
    title: "Code w/ Shayy",
    description: "No Filler, Just Code. We offer courses on Coding and Maths.",
    images: [
      {
        url: "/logo.jpg", // Path to Open Graph image
        width: 800,
        height: 600,
        alt: "Code w/ Shayy Open Graph Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@codewithshayy", // Twitter handle
    title: "Code w/ Shayy",
    description: "No Filler, Just Code. We offer courses on Coding and Maths.",
    images: ["/logo.jpg"], // Path to Twitter image
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider>
      <html lang="en">
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link
            rel="icon"
            href="/icon?<generated>"
            type="image/<generated>"
            sizes="<generated>"
          />
          <link
            rel="apple-touch-icon"
            href="/apple-icon?<generated>"
            type="image/<generated>"
            sizes="<generated>"
          />
        </Head>
        <body
          className={`${fontBurbankBlack.variable} ${fontBurbankMedium.variable} overflow-y-scroll overflow-x-hidden`}
        >
          <Navigation />
          {children}
          <Footer />
        </body>
      </html>
    </ThemeProvider>
  )
}
