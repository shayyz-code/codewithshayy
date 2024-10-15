"use client";

import Image from "next/image";
import Slide from "./Slide";
import { motion } from "framer-motion";

export default function Canvas7() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-10 py-28 relative border-y-8 border-black flex items-center justify-end"
    >
      <Image
        src="/bg6.jpg"
        fill={true}
        alt="bg"
        style={{ objectFit: "cover" }}
        className="-z-50"
      />
      <Slide cImg="Purple" justify="center">
        <h2 className="absolute font-burbankblack text-lg md:w-[450px] md:text-3xl text-center tracking-wider bg-white py-2 md:py-3">
          🫐 Forget the beginner struggles.
        </h2>

        {/* <p>Enroll now, and start coding smarter, not harder.</p> */}
      </Slide>
    </motion.div>
  );
}
