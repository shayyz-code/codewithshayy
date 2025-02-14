"use client"
import { ReactNode, useEffect, useState } from "react"
import { createContext } from "react"
import getAllCourses from "@/backend/getAllCourses"
import { TCourse } from "./courseContext"
import getAllProjects from "@/backend/getAllProjects"

export type TProject = {
  key: string
  title: string
  description: string
  tags: string
  photo_url: string
  slug: string
  site: string
}

export type TProjectWithoutKey = {
  title: string
  description: string
  tags: string
  photo_url: string
  slug: string
  site: string
}

const projectContextDefaultValues: TProject = {
  key: "",
  title: "",
  description: "",
  tags: "",
  photo_url: "",
  slug: "",
  site: "",
}

export const ProjectsContext = createContext<TProject[]>([
  projectContextDefaultValues,
])

export default function ProjectsContextProvider({
  children,
}: {
  children: ReactNode
}) {
  const [projects, setProjects] = useState<TProject[]>([])

  useEffect(() => {
    async function fetchData() {
      const data = await getAllProjects()
      setProjects(data)
    }
    fetchData()
  }, [])

  return (
    <ProjectsContext.Provider value={projects}>
      {children}
    </ProjectsContext.Provider>
  )
}
