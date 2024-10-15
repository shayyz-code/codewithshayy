"use client";

import Image from "next/image";
import PrimaryBtn from "../PrimaryBtn";
import { motion } from "framer-motion";

export default function Canvas1() {
  return (
    <div className="relative p-10 md:px-16 py-28 md:py-40 mb-2">
      <Image
        src="/bg4.jpg"
        alt="comic bg"
        fill
        style={{ objectFit: "cover" }}
        className="-z-20"
        priority={true}
      />
      <div className="md:relative">
        <motion.div
          initial={{ x: -200, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="-z-10 flex justify-center md:justify-end items-center md:h-full md:absolute md:top-0 md:right-0"
        >
          <Image
            src="/image1.jpg"
            alt="poster image of event"
            width={400}
            height={400}
            priority={true}
            className="mb-10 md:mb-0 shadow-2xl shadow-primary border-4 border-black"
          />
        </motion.div>
        <motion.div
          initial={{ x: -200, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="text-white"
        >
          <ul className="flex gap-2 text-xs mb-5">
            <li className="px-2 py-1 bg-white border-2 font-burbankmedium border-black text-black">
              Mingalabar
            </li>
          </ul>
          <h2 className="font-burbankblack md:[w-500px] text-3xl md:text-5xl tracking-wider">
            Stop Wasting Time.
            <br />
            Start Coding. 🧸
          </h2>
          <p className="font-burbankmedium md:w-[500px] text-base mt-5 mb-10">
            <span className="text-xl font-burbankblack tracking-widest text-primary">
              Code w/ Shayy
            </span>{" "}
            is your{" "}
            <span className="font-burbankblack tracking-widest text-xl">
              go-to hub
            </span>{" "}
            for practical coding. We skip the fluff and focus on building
            real-world projects. Join us to turn{" "}
            <span className="font-burbankblack tracking-widest text-xl">
              ideas into code—fast.
            </span>
          </p>
          <PrimaryBtn href="/enroll" size="md">
            Enroll
          </PrimaryBtn>
        </motion.div>
      </div>
    </div>
  );
}
