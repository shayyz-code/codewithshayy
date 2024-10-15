"use client";

import { TEvent } from "@/context/eventsContext";
import { clto } from "@/functions/convertModel";
import Image from "next/image";
import { motion } from "framer-motion";

export default function LatestEvent({ data }: { data: TEvent }) {
  return (
    <article className="relative group flex flex-col md:flex-row justify-center gap-5 lg:gap-10 border-y-8 p-10 border-black overflow-hidden">
      <Image
        src="/bg6.jpg"
        alt="comic bg"
        fill
        style={{ objectFit: "cover" }}
        className="-z-20"
      />
      {data && data.photo_url && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="mx-auto"
        >
          <Image
            src={data.photo_url}
            alt="picture of course"
            width={500}
            height={500}
            className="shadow-2xl shadow-pink-500 mb-5 md:mb-0 border-4 border-black"
          />
        </motion.div>
      )}
      {data.description ? (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
        >
          <ul className="flex gap-2 text-xs">
            <li className="px-2 py-1 font-burbankmedium bg-white border-2 border-black text-black">
              Latest Event
            </li>
          </ul>
          <div>
            <h2 className="font-burbankblack text-2xl tracking-wider pt-2">
              {data.title}
            </h2>
            <div className="font-burbankmedium py-2">
              📅 Date: {data.date}
              <br />⏰ Time: [{data.time}]
            </div>
            <p className="text-base pb-1 font-burbankmedium">
              {clto(data.description).map((item, index) => {
                if (index === 0) {
                  return (
                    <span key={index}>
                      <strong className=" text-primary">{item.key}</strong>
                      {` ${item.value}`}
                    </span>
                  );
                } else {
                  return (
                    <span key={index}>
                      <em className="">{` ${item.key}`}</em>
                      {` ${item.value}`}
                    </span>
                  );
                }
              })}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="text-white"
        >
          <ul className="flex gap-2 text-xs mb-3">
            <li className="px-2 py-1 bg-white border-2 font-burbankmedium border-black text-black">
              Latest Event
            </li>
          </ul>
          <h2 className="font-burbankblack md:[w-500px] text-2xl md:text-3xl tracking-wider">
            No Latest Event.
          </h2>
        </motion.div>
      )}
    </article>
  );
}
