"use client"

import type { ReactNode } from "react"
import Hero from "@/ui/sections/hero"
import Developer from "@/ui/sections/developer"
import StayTuned from "@/ui/sections/stay-tuned"
import FeaturedProjects from "@/ui/sections/featured-projects"
import type { Project } from "@/data/projects"
import type { SiteSettings } from "@/data/settings"

/**
 * Markdown arrives already rendered, as elements. This screen is "use client"
 * for framer-motion, so rendering it here would pull react-markdown into the
 * bundle for every visitor; the route renders it on the server instead.
 */
export default function Home({
  projects,
  settings,
  heroBody,
}: {
  projects: Project[]
  settings: SiteSettings
  heroBody: ReactNode
}) {
  return (
    <section className="flex flex-col mb-16">
      <Hero
        eyebrow={settings.heroEyebrow}
        heading={settings.heroHeading}
        ctaLabel={settings.heroCtaLabel}
        ctaHref={settings.heroCtaHref}
      >
        {heroBody}
      </Hero>
      <Developer
        title={settings.developerTitle}
        name={settings.developerName}
        badge={settings.developerBadge}
        photoKey={settings.developerMediaKey}
        backgroundKey={settings.backgroundMediaKey}
      />
      <FeaturedProjects projects={projects} />
      <StayTuned />
    </section>
  )
}
