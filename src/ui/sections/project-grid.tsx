"use client"

import { motion } from "framer-motion"
import type { Project } from "@/data/projects"
import ProjectCard from "./project-card"

// The card grid, rendered by /, /me and /projects.
//
// Purely presentational. Data is fetched in the route's server component
// and passed down — no context, no useEffect, and no loading skeleton, because
// the markup arrives already populated.
export default function ProjectGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null

  return (
    <motion.ul
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.5, type: "spring" }}
      className="flex flex-wrap gap-10 justify-center pb-5"
    >
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard data={project} />
        </li>
      ))}
    </motion.ul>
  )
}
