"use client"

import Image from "next/image"
import PrimaryBtn from "@/ui/primitives/primary-btn"
import { motion } from "framer-motion"

export default function Hero({
  eyebrow,
  heading,
  ctaLabel,
  ctaHref,
  children,
}: {
  eyebrow: string | null
  /** Newline-separated; each line gets its own black-backed block. */
  heading: string | null
  ctaLabel: string | null
  ctaHref: string | null
  /** The body copy, rendered as markdown by the route. */
  children: React.ReactNode
}) {
  return (
    <div className="relative p-10 md:px-16 py-28 md:py-40 mb-2 bg-primary">
      {/* <Image
        src="/logo.webp"
        unoptimized
        alt="comic bg"
        fill
        style={{ objectFit: "cover" }}
        className="z-10"
        priority={true}
      /> */}
      <div className="md:relative">
        <motion.div
          initial={{ x: -200, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="flex justify-center md:justify-end items-center md:h-full md:absolute md:top-0 md:right-0"
        >
          <Image
            src="/logo.webp"
            unoptimized
            alt="poster image of event"
            width={600}
            height={600}
            priority={true}
            className="mb-10 md:mb-0 z-10 shadow-2xl shadow-primary"
          />
        </motion.div>
        <motion.div
          initial={{ x: -200, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="text-white sticky z-20"
        >
          {eyebrow && (
            <ul className="flex gap-2 text-xs mb-5">
              <li className="px-2 py-1 bg-white font-body text-black">
                {eyebrow}
              </li>
            </ul>
          )}
          {heading && (
            <h2 className="font-display md:[w-500px] text-3xl md:text-5xl">
              {heading.split("\n").map((line) => (
                <div key={line} className="bg-black w-fit">
                  {line}
                </div>
              ))}
            </h2>
          )}
          {children && (
            <div className="hero-prose font-body md:w-[500px] text-base mt-5 mb-10 bg-black">
              {children}
            </div>
          )}
          {ctaLabel && ctaHref && (
            <PrimaryBtn href={ctaHref} size="md">
              {ctaLabel}
            </PrimaryBtn>
          )}
        </motion.div>
      </div>
    </div>
  )
}
