"use client";

import Image from "next/image";
import AddCourse from "./AddCourse";
import ManageCourse from "./ManageCourse";
import { useState } from "react";
import EditCourse from "./EditCourse";
import EditCourseProvider from "@/context/editCourseContext";

export default function Dashboard() {
  const [tab, setTab] = useState<"add" | "edit">("add");
  return (
    <div className="relative px-10 py-24">
      <Image
        src="/bg1.jpg"
        alt="hi"
        fill={true}
        style={{ objectFit: "cover" }}
      />
      <div className="bg-gray-100/50 dark:bg-gray-700/50 backdropBlur rounded-xl p-5">
        <div className="header py-5 h-12 px-5 flex justify-between">
          <h2 className="font-burbankblack tracking-widest text-2xl uppercase">
            Dashboard
          </h2>
          <div>
            <button
              className={`uppercase text-sm px-3 py-1 bg-black/20 rounded-tl-md rounded-bl-md ${
                tab === "add" && "bg-secondary/80"
              }`}
              onClick={() => setTab("add")}
            >
              Add
            </button>
            <button
              className={`uppercase text-sm px-3 py-1 bg-black/20  rounded-tr-md rounded-br-md ${
                tab === "edit" && "bg-secondary/80"
              }`}
              onClick={() => setTab("edit")}
            >
              Edit
            </button>
          </div>
        </div>
        {tab === "add" && (
          <div className="mx-3 mt-6">
            <AddCourse />
          </div>
        )}
        {tab === "edit" && (
          <div className="flex flex-col mx-3 mt-6 lg:flex-row">
            <EditCourseProvider>
              <EditCourse />
              <ManageCourse />
            </EditCourseProvider>
          </div>
        )}
      </div>
    </div>
  );
}
