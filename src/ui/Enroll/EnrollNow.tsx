"use client";

import Image from "next/image";
import PrimaryBtn from "../PrimaryBtn";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/backend/firebase";

export default function EnrollNow() {
  const [enrollnow_url, setEnrollnow_url] = useState<string>("");
  useEffect(() => {
    async function fetchData() {
      const ref = doc(db, "pageprops", "enrollnow");
      const snapshot = await getDoc(ref);
      const data = snapshot.data() as { photo_url: string };
      if (snapshot.exists()) {
        setEnrollnow_url(data.photo_url);
      }
    }
    fetchData();
  }, []);
  return (
    <article className="relative p-10 md:px-16 py-28 pb-16 md:py-40">
      <Image
        src="/bg10.jpg"
        alt="comic bg"
        fill
        style={{ objectFit: "cover" }}
        className="-z-20"
      />
      <div className="md:relative">
        {enrollnow_url && (
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.5, type: "spring" }}
            className="-z-10 flex justify-center md:justify-end items-center md:h-full md:absolute md:top-0 md:right-0"
          >
            <Image
              src={enrollnow_url}
              alt="poster image of event"
              width={400}
              height={400}
              className="mb-10 md:mb-0 shadow-2xl shadow-red-500 border-4 border-black"
            />
          </motion.div>
        )}
        <motion.div
          initial={{ x: -200, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="text-white"
        >
          <ul className="flex gap-2 text-xs mb-3">
            <li className="px-2 py-1 bg-white border-2 font-burbankmedium border-black text-black">
              Are you Ready?
            </li>
          </ul>
          <h2 className="font-burbankblack md:[w-500px] text-2xl md:text-3xl tracking-wider">
            🍪 Enroll Now and Start Coding
          </h2>
          <p className="font-burbankmedium md:w-[500px] text-base mt-2 mb-10">
            <span className="text-2xl font-burbankblack tracking-widest text-primary">
              Your journey to becoming a developer starts here.
            </span>{" "}
            We offer hands-on courses that get you building real projects fast,
            whether you're a beginner or looking to advance your skills.{" "}
            <span className="font-burbankblack tracking-widest text-xl">
              No fluff, no wasted time
            </span>{" "}
            — just the skills you need to succeed.
          </p>
          <PrimaryBtn href="/enroll/form" size="md">
            Enroll Now
          </PrimaryBtn>
        </motion.div>
      </div>
    </article>
  );
}
