"use client"

import Image from "next/image"
import Band, { SlideIn } from "./Band"

// The name-and-title band, over the background photo. Home and Me each had
// their own copy of this file; the only differences were padding and type size,
// so those are a prop and the markup is shared.
//
// The old copies both still exported a function called `Canvas4`, from before
// the files were renamed.
export default function Developer({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg"

  return (
    <Band align="end" className={`px-10 ${lg ? "py-20" : "py-16"}`}>
      <Image
        src="/bg4.webp"
        unoptimized
        fill={true}
        alt="bg"
        style={{ objectFit: "cover" }}
        className="-z-50"
      />
      <SlideIn
        className={
          lg
            ? "px-12 py-2 font-burbankblack text-xl md:text-3xl text-right w-full"
            : "px-12 py-2 font-burbankblack text-lg md:text-2xl"
        }
      >
        <p>Software Engineer</p>
        <p className="text-[9px] md:text-base">Aung Min Khant aka. Shayy</p>
      </SlideIn>

      <SlideIn className="bg-primary px-4 py-2 font-burbankblack text-lg md:text-2xl">
        <Image
          src="/developer.webp"
          unoptimized
          alt="photo of developer"
          width={200}
          height={200}
          priority={true}
          className="my-2 z-10 rounded-full"
        />
        <p className="text-right">Shayy</p>
      </SlideIn>
    </Band>
  )
}
