"use client";
import { ReactNode, useEffect, useState } from "react";
import { createContext } from "react";
import getAllCourses from "@/backend/getAllCourses";
import { TCourse } from "./courseContext";

const courseContextDefaultValues: TCourse = {
  key: "",
  title: "",
  description: "",
  tags: "",
  slug: "",
  photo_url: "",
};

export const CoursesContext = createContext<TCourse[]>([
  courseContextDefaultValues,
]);

export default function CoursesContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [courses, setCourses] = useState<TCourse[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getAllCourses("courses_brief");
      setCourses(data);
    }
    fetchData();
  }, []);

  return (
    <CoursesContext.Provider value={courses}>
      {children}
    </CoursesContext.Provider>
  );
}
