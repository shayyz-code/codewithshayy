"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function EnrollCanvas3() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-10 py-16 relative border-y-8 border-black flex items-center justify-start"
    >
      <Image
        src="/bg2.jpg"
        fill={true}
        alt="bg"
        objectFit="cover"
        className="-z-50"
      />
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1.5, type: "spring" }}
        className="bg-white border-4 border-black px-4 py-2 text-black max-w-md"
      >
        <h2 className="font-burbankblack text-xl tracking-wider">
          ⚡ Expert Guidance
        </h2>
        <p>
          Learn from experienced developers who knows the challenges and
          shortcuts to help you code smarter.
        </p>
      </motion.div>
    </motion.div>
  );
}
