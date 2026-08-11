import { useContext } from "react"
import CCard from "./CCard"
import CLoadingCard from "./CLoadingCard"
import { motion } from "framer-motion"
import { CoursesContext } from "@/context/coursesContext"
import { TCourse } from "@/context/courseContext"

export default function CCanvas1({
  specificCourses = null,
}: {
  specificCourses?: TCourse[] | null
}) {
  // Hook must run unconditionally — the previous inline ternary called
  // useContext only when specificCourses was null, breaking hook order.
  const contextCourses = useContext(CoursesContext)
  const courses = specificCourses ?? contextCourses

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
            <CLoadingCard />
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
          <CCard data={doc} isSpecificCourse={specificCourses !== null}></CCard>
        </li>
      ))}
    </motion.ul>
  )
}
