import { useContext } from "react"
import { motion } from "framer-motion"
import { ProjectsContext, TProject } from "@/context/projectsContext"
import ProjectCard from "./ProjectCard"
import ProjectLoadingCard from "./ProjectLoadingCard"

export default function Projects({
  specificProjects = null,
}: {
  specificProjects?: TProject[] | null
}) {
  // Hook must run unconditionally — the previous inline ternary called
  // useContext only when specificProjects was null, breaking hook order.
  const contextProjects = useContext(ProjectsContext)
  const courses = specificProjects ?? contextProjects

  if (courses.length === 0)
    return (
      <motion.ul
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className="flex flex-wrap gap-10 justify-center pb-5"
      >
        {[0, 1, 2].map((val) => (
          <li key={val}>
            <ProjectLoadingCard />
          </li>
        ))}
      </motion.ul>
    )

  return (
    <motion.ul
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.5, type: "spring" }}
      className="flex flex-wrap gap-10 justify-center pb-5"
    >
      {courses.map((doc) => (
        <li key={doc.key}>
          <ProjectCard data={doc}></ProjectCard>
        </li>
      ))}
    </motion.ul>
  )
}
