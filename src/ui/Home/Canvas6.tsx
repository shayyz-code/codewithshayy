"use client";

import { motion } from "framer-motion";

export default function Canvas6() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-10 py-16 relative border-y-8 border-black flex items-center justify-end"
    >
      <div className="absolute top-0 left-0 w-full h-full -z-50"></div>
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1.5, type: "spring" }}
        className="bg-white max-w-[400px] border-4 border-black px-4 py-2 text-black font-burbankblack shadow-3xl shadow-secondary"
      >
        <h2 className="font-burbankblack text-xl tracking-wider">
          ⚡ Because you will have no time to waste.
        </h2>
        <p className="font-burbankmedium">
          At Code w/ Shayy, we can skip the boring theory and focus on what
          really matters—building stuff. You'll be hands-on from day one,
          learning by doing, and working on projects that actually prepare you
          for the real world.
        </p>
      </motion.div>
    </motion.div>
  );
}
