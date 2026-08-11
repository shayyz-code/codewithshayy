"use client"

import Band, { SlideIn } from "./Band"

// The blue label that introduces a section. Was Me/Canvas5, which hardcoded
// "About Me"; the text is a prop so a second one does not mean a second file.
export default function SectionLabel({ children }: { children: string }) {
  return (
    <Band className="px-10 py-8">
      <SlideIn className="bg-primary border-4 border-black px-4 py-2 text-white font-burbankblack text-lg md:text-2xl">
        {children}
      </SlideIn>
    </Band>
  )
}
