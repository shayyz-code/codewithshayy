"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { Project } from "@/data/projects"
import Band from "./Band"
import ProjectGrid from "./ProjectGrid"
import PrimaryBtn from "../PrimaryBtn"

// Was Me/Canvas3, imported by Home across the feature boundary. Both / and /me
// render it, so it belongs to neither.
export default function FeaturedProjects({
  projects,
}: {
  projects: Project[]
}) {
  return (
    <Band className="px-5 py-16 md:py-10 flex-col gap-16">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
      >
        <h2 className="font-burbankblack text-3xl md:text-4xl text-center uppercase tracking-wider">
          Projects
        </h2>
        <p className="font-burbankmedium text-center">
          See all my projects at{" "}
          <Link
            className="text-sky-600"
            href="https://www.github.com/shayyz-code/"
          >
            github.com/shayyz-code
          </Link>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, type: "spring" }}
        className="flex gap-5 flex-wrap justify-center md:flex-nowrap items-center"
      >
        <ProjectGrid projects={projects} />
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
      >
        <PrimaryBtn
          href="https://github.com/shayyz-code?tab=repositories"
          size="sm"
        >
          See GitHub
        </PrimaryBtn>
      </motion.div>
    </Band>
  )
}
