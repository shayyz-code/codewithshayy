"use client"

import Band, { SlideIn } from "./band"

// The blue label that introduces a section. Was Me/Canvas5, which hardcoded
// "About Me"; the text is a prop so a second one does not mean a second file.
//
// It introduces a section, so it is a heading. `as` picks the level: on /me it
// is the page's only <h1>, since the site header stopped being one.
export default function SectionLabel({
  children,
  as: Heading = "h2",
}: {
  children: string
  as?: "h1" | "h2"
}) {
  return (
    <Band className="px-10 py-8">
      <SlideIn className="bg-primary border-4 border-black px-4 py-2 text-white font-display text-lg md:text-2xl">
        <Heading>{children}</Heading>
      </SlideIn>
    </Band>
  )
}
