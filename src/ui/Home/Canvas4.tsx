"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Canvas4() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-10 py-16 relative border-y-8 border-black flex items-center justify-end"
    >
      <Image
        src="/bg4.jpg"
        fill={true}
        alt="bg"
        style={{ objectFit: "cover" }}
        className="-z-50"
      />
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1.5, type: "spring" }}
        className="bg-white border-4 border-black px-4 py-2 text-black font-burbankblack text-3xl tracking-wider"
      >
        No Filler. Just Code. 🥝
      </motion.div>
    </motion.div>
  );
}
