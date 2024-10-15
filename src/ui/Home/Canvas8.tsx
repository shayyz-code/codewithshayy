"use client";

import { motion } from "framer-motion";

export default function Canvas8() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-10 py-16 relative border-y-8 border-black flex items-center justify-start"
    >
      <div className="absolute top-0 left-0 w-full h-full -z-50"></div>
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1.5, type: "spring" }}
        className="bg-white max-w-[400px] border-4 border-black px-4 py-2 text-black font-burbankblack shadow-4xl shadow-secondary"
      >
        <p className="font-burbankmedium">
          🍪 We have been there, and we know what slows people down. That&apos;s
          why every course is designed to help you learn faster and skip the
          common mistakes. Instead of spinning your wheels, you'll be up and
          running with real projects in no time.
        </p>
      </motion.div>
    </motion.div>
  );
}
