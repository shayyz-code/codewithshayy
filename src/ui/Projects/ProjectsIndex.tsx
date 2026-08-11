"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import type { Project } from "@/data/projects"
import Projects from "../Me/Projects"

export default function ProjectsIndex({ projects }: { projects: Project[] }) {
  return (
    <section className="flex flex-col px-5 py-28 md:py-32 gap-16 items-center">
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className="flex flex-col gap-2 items-center"
      >
        <h1 className="font-burbankblack text-3xl md:text-4xl uppercase tracking-wider">
          Projects
        </h1>
        <p className="font-burbankmedium text-center">
          See all my projects at{" "}
          <Link
            className="text-sky-600"
            href="https://www.github.com/shayyz-code/"
          >
            github.com/shayyz-code
          </Link>
        </p>
      </motion.header>

      {projects.length > 0 ? (
        <Projects projects={projects} />
      ) : (
        <p className="font-burbankmedium">Nothing here yet.</p>
      )}
    </section>
  )
}
