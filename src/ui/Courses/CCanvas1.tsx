import { useContext } from "react";
import CCard from "./CCard";
import CLoadingCard from "./CLoadingCard";
import { motion } from "framer-motion";
import { CoursesContext } from "@/context/coursesContext";

export default function CCanvas1() {
  const courses = useContext(CoursesContext);

  if (courses.length === 0)
    return (
      <motion.ul
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className="flex flex-wrap gap-10 justify-center h-[88%] pb-5 overflow-y-scroll"
      >
        {[0, 1, 2].map((val) => (
          <li key={val}>
            <CLoadingCard />
          </li>
        ))}
      </motion.ul>
    );

  return (
    <motion.ul
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.5, type: "spring" }}
      className="flex flex-wrap gap-10 justify-center h-[88%] pb-5 overflow-y-scroll"
    >
      {courses.map((doc) => (
        <li key={doc.key}>
          <CCard data={doc}></CCard>
        </li>
      ))}
    </motion.ul>
  );
}
