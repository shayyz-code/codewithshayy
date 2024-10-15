"use client";

import { useEffect, useState } from "react";
import PrimaryBtn from "../PrimaryBtn";
import TextInput from "../TextInput";
import Image from "next/image";
import SelectInput, { TSelectItem } from "../SelectInput";
import addEnrolled from "@/backend/addEnrolled";
import getAllCourses from "@/backend/getAllCourses";

export default function EnrollForm() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [courses, setCourses] = useState<TSelectItem[]>([]);
  const [course, setCourse] = useState<TSelectItem>({
    key: "",
    title: "",
  });

  const [status, setStatus] = useState<
    "loading" | "uploaded" | "failed" | "idle"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    if (!name || !email || course.key === "") {
      setStatus("idle");
      return;
    } else {
      const res = await addEnrolled({ name, email, course });
      if (res.status === "ok") {
        setStatus("uploaded");
      } else {
        setStatus("failed");
      }
    }
  };

  useEffect(() => {
    async function fetchData() {
      const data = await getAllCourses("courses_brief");
      if (data) {
        const keyTitleData = data.map((item) => {
          return { key: item.key, title: item.title };
        });
        setCourses(keyTitleData);
      }
    }

    fetchData();
  }, []);

  return (
    <section className="flex flex-col">
      <div className="flex flex-col items-center py-28 md:py-40 gap-5">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden relative px-10 py-5 w-[350px] shadow-2xl shadow-orange-600 border-4 border-black"
        >
          <Image
            src="/bg2.jpg"
            alt="comic bg"
            width={800}
            height={800}
            className="absolute top-10 left-0 scale-[250%] w-full -z-20"
          />
          <h3 className="font-burbankblack tracking-widest uppercase text-3xl lg:text-4xl max-w-lg text-center mb-5">
            🚀 Enroll <b className="text-secondary">Form</b>
          </h3>
          <TextInput
            type="text"
            labelForVal="name"
            labelVal="Name"
            value={name}
            setValue={setName}
          />
          <TextInput
            type="email"
            labelForVal="email"
            labelVal="Email"
            value={email}
            setValue={setEmail}
          />
          <SelectInput list={courses} value={course} setValue={setCourse} />
          <div className="flex justify-center items-center pt-5">
            <PrimaryBtn type="submit" size="sm" status={status}>
              Submit
            </PrimaryBtn>
          </div>
        </form>
      </div>
      <p className="px-10 pb-10 text-center font-burbankmedium">
        {"Once you've enrolled, we'll try to contact you as soon as possible."
          .split(" ")
          .map((word, index) => (
            <b key={index} className="hover:bg-secondary">{` ${word} `}</b>
          ))}
      </p>
    </section>
  );
}
