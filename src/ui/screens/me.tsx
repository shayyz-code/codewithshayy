"use client"

import Developer from "@/ui/sections/developer"
import SectionLabel from "@/ui/sections/section-label"
import Bio from "@/ui/sections/bio"
import Contact from "@/ui/sections/contact"
import { motion } from "framer-motion"
import FeaturedProjects from "@/ui/sections/featured-projects"
import type { Project } from "@/data/projects"
import type { SiteSettings } from "@/data/settings"
import type { ReactNode } from "react"

export default function Me({
  projects,
  settings,
  bio,
}: {
  projects: Project[]
  settings: SiteSettings
  /** Rendered on the server — see the note in home.tsx. */
  bio: ReactNode
}) {
  return (
    <section className="flex flex-col mb-16">
      <Developer
        size="lg"
        title={settings.developerTitle}
        name={settings.developerName}
        badge={settings.developerBadge}
        photoKey={settings.developerMediaKey}
        backgroundKey={settings.backgroundMediaKey}
      />
      <SectionLabel>About Me</SectionLabel>
      <Bio>{bio}</Bio>
      <FeaturedProjects projects={projects} />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className="w-[350px] mx-auto flex flex-col items-center py-16 justify-center gap-10"
      >
        <h3 className="font-display uppercase text-xl lg:text-2xl max-w-lg text-center">
          Let&apos;s Work <b className="text-secondary">Together</b>?
        </h3>
        <p className="px-10 text-center font-body">
          {"Turn your ideas into Quality Outcomes."
            .split(" ")
            .map((word, index) => (
              <b key={index} className="hover:bg-secondary">{` ${word} `}</b>
            ))}
        </p>
      </motion.div>
      <Contact
        email={settings.contactEmail}
        phone={settings.contactPhone}
        location={settings.contactLocation}
      />
    </section>
  )
}
