"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HowToEnroll() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.5, type: "spring" }}
      className="flex flex-col items-center justify-center"
    >
      <h2 className="relative font-burbankblack text-2xl md:text-4xl tracking-wider uppercase text-center p-5 px-10 border-4 border-black">
        <Image
          src={`/bg5.jpg`}
          alt="picture of mode"
          fill={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          className="-z-10"
        />
        How to Enroll
      </h2>
      <div className="flex flex-col gap-5 w-[350px] px-5 mt-12">
        <div>
          <h3 className="font-burbankblack tracking-wider text-xl pb-4">
            Choose Your Course
          </h3>

          <ul className="flex flex-col gap-2 px-5 list-disc">
            <li className="flex gap-2 text-sm text-gray-600 dark:text-slate-300">
              <p>Web Dev with HTML, CSS, and JavaScript</p>
            </li>
            <li className="flex gap-2 text-sm text-gray-600 dark:text-slate-300">
              <p>JavaScript with TypeScript</p>
            </li>
            <li className="flex gap-2 text-sm text-gray-600 dark:text-slate-300">
              <p>Web Dev with React and Next.js</p>
            </li>
            <li className="flex gap-2 text-sm text-sky-500">
              <p>
                <Link href="/courses">See all courses &gt;</Link>
              </p>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-burbankblack tracking-wider text-xl pb-4">
            Fill Out the Form
          </h3>

          <ul className="flex flex-col gap-2 px-5 list-disc">
            <li className="flex gap-2 text-sm text-gray-600 dark:text-slate-300">
              <p>
                Just enter your details correctly. We&apos;ll contact you back
                asap.
              </p>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-burbankblack tracking-wider text-xl pb-4">
            Start Learning
          </h3>
          <ul className="flex flex-col gap-2 px-5 list-disc">
            <li className="flex gap-2 text-sm text-gray-600 dark:text-slate-300">
              <p>Begin your journey together with other passionate friends.</p>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
