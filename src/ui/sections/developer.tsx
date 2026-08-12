"use client"

import Image from "next/image"
import Band, { SlideIn } from "./band"

// The name-and-title band, over the background photo. Home and Me each had
// their own copy of this file; the only differences were padding and type size,
// so those are a prop and the markup is shared.
//
// The old copies both still exported a function called `Canvas4`, from before
// the files were renamed.
export default function Developer({
  size = "md",
  title,
  name,
  badge,
  photoKey,
  backgroundKey,
}: {
  size?: "md" | "lg"
  title: string | null
  name: string | null
  badge: string | null
  /** R2 keys. Null falls back to the committed file in public/. */
  photoKey: string | null
  backgroundKey: string | null
}) {
  const lg = size === "lg"
  const photo = photoKey ? `/media/${photoKey}` : "/developer.webp"
  const background = backgroundKey ? `/media/${backgroundKey}` : "/bg4.webp"

  return (
    <Band align="end" className={`px-10 ${lg ? "py-20" : "py-16"}`}>
      <Image
        src={background}
        unoptimized={!backgroundKey}
        fill={true}
        alt="bg"
        style={{ objectFit: "cover" }}
        className="-z-50"
      />
      <SlideIn
        className={
          lg
            ? "px-12 py-2 font-display text-xl md:text-3xl text-right w-full"
            : "px-12 py-2 font-display text-lg md:text-2xl"
        }
      >
        {title && <p>{title}</p>}
        {name && <p className="text-[9px] md:text-base">{name}</p>}
      </SlideIn>

      <SlideIn className="bg-primary px-4 py-2 font-display text-lg md:text-2xl">
        <Image
          src={photo}
          unoptimized={!photoKey}
          alt="photo of developer"
          width={200}
          height={200}
          priority={true}
          className="my-2 z-10 rounded-full"
        />
        {badge && <p className="text-right">{badge}</p>}
      </SlideIn>
    </Band>
  )
}
