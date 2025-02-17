"use client"

import { motion } from "framer-motion"
import PrimaryBtn from "../PrimaryBtn"
import Link from "next/link"
import { Suspense, useContext } from "react"
import CoursesContextProvider, {
  CoursesContext,
} from "@/context/coursesContext"
import CCanvas1 from "../Courses/CCanvas1"

export default function Canvas3() {
  const courses = useContext(CoursesContext)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-5 py-16 md:py-10 relative border-y-8 border-black flex flex-col items-center justify-center gap-16"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className=""
      >
        <h2 className="font-burbankblack text-3xl md:text-4xl text-center uppercase tracking-wider">
          Featured Courses
        </h2>
        <p className="font-burbankmedium text-center">
          Courses are now available for free only at{" "}
          <Link href="https://www.rangoonacademy.com/courses">
            rangoon-academy.com
          </Link>
        </p>
      </motion.div>
      <CCanvas1
        specificCourses={courses.filter((undefined, index) => index <= 3)}
      />
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className=""
      >
        <PrimaryBtn href="https://www.rangoon-academy.com/courses" size="sm">
          See More
        </PrimaryBtn>
      </motion.div>
    </motion.div>
  )
}
