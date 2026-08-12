"use client"

import Band, { SlideIn } from "./band"

// Was Me/Canvas8.
export default function Bio() {
  return (
    <Band align="start" className="px-10 py-0">
      <SlideIn className="bg-white max-w-[620px] px-4 py-2 text-black font-display shadow-4xl shadow-secondary">
        <p className="font-body">
          Heyy, I&apos;m Shayy, a{" "}
          <span className="text-[#B7410E] font-display italic">Rusty</span>{" "}
          Software Engineer. I&apos;ve been coding since I was 12, and now I build
          industry projects and contribute to open source, when I can.
        </p>
      </SlideIn>
    </Band>
  )
}
