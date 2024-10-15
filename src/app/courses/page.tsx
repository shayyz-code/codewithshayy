"use client";

import Courses from "@/ui/Courses/Courses";
import { CourseProvider } from "@/context/courseContext";
import CoursesContextProvider from "@/context/coursesContext";
import { Suspense } from "react";

export default function PageCourses() {
  return (
    <main className="min-h-screen text-slate-900 dark:text-white">
      <Suspense>
        <CoursesContextProvider>
          <CourseProvider>
            <Courses />
          </CourseProvider>
        </CoursesContextProvider>
      </Suspense>
    </main>
  );
}
