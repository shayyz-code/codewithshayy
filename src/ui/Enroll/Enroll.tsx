"use client";

import EnrollNow from "./EnrollNow";
import EnrollCanvas2 from "./EnrollCanvas2";
import EnrollCanvas3 from "./EnrollCanvas3";
import EnrollCanvas4 from "./EnrollCanvas4";
import HowToEnroll from "./HowToEnroll";
import PrimaryBtn from "../PrimaryBtn";
import { motion } from "framer-motion";

export default function Enroll() {
  return (
    <section className="flex flex-col">
      <EnrollNow />
      <div className="flex flex-wrap gap-5 gap-y-10 justify-around p-5 py-10">
        <HowToEnroll />
      </div>
      <EnrollCanvas2 />
      <EnrollCanvas3 />
      <EnrollCanvas4 />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className="w-[350px] mx-auto flex flex-col items-center py-16 justify-center gap-10"
      >
        <h3 className="font-burbankblack tracking-widest uppercase text-2xl lg:text-4xl max-w-lg text-center">
          🚀 What Are You <b className="text-secondary">Waiting For</b>?
        </h3>
        <p className="px-10 text-center">
          {"Ready to turn your ideas into code? Don't wait—get started with Code w/ Shayy today and begin building your future."
            .split(" ")
            .map((word, index) => (
              <b key={index} className="hover:bg-secondary">{` ${word} `}</b>
            ))}
        </p>
        <PrimaryBtn href="/enroll/form" size="md">
          Enroll Now
        </PrimaryBtn>
      </motion.div>
    </section>
  );
}
