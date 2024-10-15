"use client";

import Image from "next/image";
import Card from "../SelectMode/Card";
import { motion } from "framer-motion";
import PrimaryBtn from "../PrimaryBtn";

export default function Canvas3() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-10 py-24 md:py-10 relative border-y-8 border-black flex flex-col items-center justify-center gap-16"
    >
      <Image
        src="/bg3.jpg"
        fill={true}
        alt="bg"
        style={{ objectFit: "cover" }}
        className="-z-50"
      />
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className=""
      >
        <h2 className="font-burbankblack text-4xl text-center uppercase tracking-wider">
          Featured Courses
        </h2>
        <p className="font-burbankmedium text-center">Fast Practical Courses</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, type: "spring" }}
        className="flex gap-10 flex-wrap justify-center md:flex-nowrap items-center"
      >
        <Card
          displayText="Web Dev w/ HTML, CSS and JS"
          href="/courses?key=1Yqtldj4dTncM443KW6O"
          cImg="Red"
        />
        <Card
          displayText="JavaScript w/ TypeScript"
          href="/courses?key=pBdhjXYxcRTcizjcGhRs"
        />
        <Card
          displayText="Web Dev w/ React and Next.js"
          href="/courses?key=z6TI14CLGqxrH6jXoSrs"
          cImg="Blue"
        />
      </motion.div>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className=""
      >
        <PrimaryBtn href="/courses" size="md">
          See More
        </PrimaryBtn>
      </motion.div>
    </motion.div>
  );
}
