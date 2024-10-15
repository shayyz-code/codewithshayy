"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type TSlide = {
  children: React.ReactNode;
  cImg?: "Yellow" | "Red" | "Purple";
  justify?: "start" | "center" | "end";
};

export default function Slide({
  children,
  cImg = "Yellow",
  justify = "end",
}: TSlide) {
  return (
    <motion.div
      initial={
        justify === "end" ? { x: -200, opacity: 0 } : { scale: 0.5, opacity: 0 }
      }
      whileInView={
        justify === "end" ? { x: 0, opacity: 1 } : { scale: 1, opacity: 1 }
      }
      transition={{ type: "spring", duration: 1.5 }}
      className={`flex justify-${justify} w-full`}
    >
      <div
        className={`relative ${justify === "start" && "flex flex-col-reverse"}`}
      >
        <Image
          src={`/slide${cImg}.png`}
          alt="comic canvas"
          width={cImg === "Purple" ? 800 : 250}
          height={cImg === "Purple" ? 800 : 250}
          className={cImg === "Purple" ? "scale-y-[200%]" : "w-auto size-80"}
        />
        <div
          className={`font-burbankmedium ${
            justify === "center"
              ? "bg-transparent border-none"
              : "bg-white border-4 border-black"
          } text-black  w-72 md:96 px-4 py-2 ${
            justify === "end"
              ? "absolute top-1/2 transform -translate-y-1/2 right-[65px] md:right-[120px]"
              : justify === "start"
              ? "ml-5"
              : "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center"
          }`}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}
