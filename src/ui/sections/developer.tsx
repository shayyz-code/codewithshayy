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
  // Both images live in R2 now — the committed copies were removed once the
  // settings row pointed here. With no row and no key there is nothing to
  // render, which is why the elements below are conditional rather than falling
  // back to a file that no longer exists.
  const photo = photoKey ? `/media/${photoKey}` : null
  const background = backgroundKey ? `/media/${backgroundKey}` : null

  return (
    <Band align="end" className={`px-10 ${lg ? "py-20" : "py-16"}`}>
      {background && (
        <Image
          src={background}
          fill={true}
          alt=""
          style={{ objectFit: "cover" }}
          className="-z-50"
        />
      )}
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
        {photo && (
          <Image
            src={photo}
            alt="photo of developer"
            width={200}
            height={200}
            priority={true}
            className="my-2 z-10 rounded-full"
          />
        )}
        {badge && <p className="text-right">{badge}</p>}
      </SlideIn>
    </Band>
  )
}
