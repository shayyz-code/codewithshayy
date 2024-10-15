"use client";

import { motion } from "framer-motion";

export default function LookingForMaths() {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.5, type: "spring" }}
      className="flex justify-between items-center w-[350px] md:w-[600px] px-10 py-5 mx-auto my-16 font-burbankmedium bg-white text-black border-4 border-black gap-10 shadow-2xl shadow-primary"
    >
      <h3 className="text-base">
        Maths Courses are also Coming Soon. Stay Tuned &lt;/🍓&gt;
      </h3>
      {/* <PrimaryBtn href="/kids" size="sm">
        Go to
      </PrimaryBtn> */}
    </motion.div>
  );
}
