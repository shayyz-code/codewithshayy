"use client";

import getAllCourses from "@/backend/getAllCourses";
import { TCourse } from "@/context/courseContext";
import { ContextEditCourse } from "@/context/editCourseContext";
import { useContext, useEffect, useState } from "react";

export default function ManageCourse() {
  const [courses, setCourses] = useState<TCourse[]>([]);
  const { setKey } = useContext(ContextEditCourse);
  useEffect(() => {
    async function fetchData() {
      const data = await getAllCourses("courses_brief");
      setCourses(data);
    }
    fetchData();
  }, []);
  return (
    <div className="w-full lg:w-2/3 m-1 bg-white/70 dark:bg-black/30 shadow-md p-6 rounded-xl text-lg">
      <div className="overflow-hidden bg-white/70 dark:bg-black/30 shadow-md py-5 px-5 rounded-xl">
        <table className="table-auto w-full">
          <thead className="text-sm font-semibold uppercase text-white text-left">
            <tr>
              <th>Slug</th>
              <th>Courses</th>
              <th>Tags</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.length > 0 ? (
              courses.map((course) => (
                <tr key={course.key}>
                  <td>{course.slug}</td>
                  <td>{course.title}</td>
                  <td>{course.tags}</td>
                  <td className="p-2">
                    <div className="flex justify-center">
                      <a
                        href="#"
                        className="rounded-md hover:bg-green-400/20 text-green-600 px-2 flex justify-between items-center"
                        onClick={() => setKey(course.key)}
                      >
                        Edit
                      </a>
                      <button className="rounded-md hover:bg-red-600/20 text-red-600 px-2 flex justify-between items-center">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td></td>
                <td>No courses yet.</td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
