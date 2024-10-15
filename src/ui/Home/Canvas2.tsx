"use client";

import Image from "next/image";
import Slide from "./Slide";
import { motion } from "framer-motion";

export default function Canvas2() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-0 md:px-10 py-20 relative border-y-8 border-black flex items-center justify-end"
    >
      <Image
        src="/bg2.jpg"
        fill={true}
        alt="bg"
        style={{ objectFit: "cover" }}
        className="-z-50"
      />
      <Slide>
        <p>
          Learn from <i>scratch to hatch </i> and Jump into coding with hands-on
          courses that cut through the fluff. 🎃
        </p>
      </Slide>
    </motion.div>
  );
}
