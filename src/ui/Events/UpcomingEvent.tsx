"use client"

import Image from "next/image"
import PrimaryBtn from "../PrimaryBtn"
import { TEvent } from "@/context/eventsContext"
import { clto } from "@/functions/convertModel"
import { motion } from "framer-motion"

export default function UpcomingEvent({ data }: { data?: TEvent }) {
  const handleOnClick = () => {}
  return (
    <article className="relative p-10 md:px-16 py-28 md:py-40">
      <div className="md:relative">
        {data && data.photo_url && (
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.5, type: "spring" }}
            className="-z-10 flex justify-center md:justify-end items-center md:h-full md:absolute md:top-0 md:right-0"
          >
            <Image
              src={data.photo_url}
              alt="poster image of event"
              width={400}
              height={400}
              className="mb-10 md:mb-0 shadow-2xl shadow-slate-100 border-4 border-black"
            />
          </motion.div>
        )}
        {data?.description ? (
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.5, type: "spring" }}
            className="text-white"
          >
            <ul className="flex gap-2 text-xs mb-3">
              <li className="px-2 py-1 bg-white border-2 font-burbankmedium border-black text-black">
                Upcoming Event
              </li>
            </ul>
            <h2 className="font-burbankblack md:[w-500px] text-2xl md:text-3xl tracking-wider">
              {data.title}
            </h2>
            <div className="font-burbankmedium py-2">
              📅 Date: {data.date}
              <br />⏰ Time: [{data.time}]
            </div>
            <p className="font-burbankmedium md:w-[500px] text-base mt-2 mb-10">
              {clto(data.description).map((item, index) => {
                if (index === 0) {
                  return (
                    <span key={index}>
                      <span className="text-2xl font-burbankblack tracking-widest text-primary">
                        {item.key}
                      </span>
                      {` ${item.value}`}
                    </span>
                  )
                } else {
                  return (
                    <span key={index}>
                      <span className="font-burbankblack tracking-widest text-xl">
                        {` ${item.key}`}
                      </span>
                      {` ${item.value}`}
                    </span>
                  )
                }
              })}
            </p>
            <PrimaryBtn href={data.register_link} size="md">
              Register
            </PrimaryBtn>
          </motion.div>
        ) : (
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.5, type: "spring" }}
            className="text-white"
          >
            <ul className="flex gap-2 text-xs mb-3">
              <li className="px-2 py-1 bg-white border-2 font-burbankmedium border-black text-black">
                Upcoming Event
              </li>
            </ul>
            <h2 className="font-burbankblack md:[w-500px] text-2xl md:text-3xl tracking-wider">
              No Upcoming Event Yet.
            </h2>
          </motion.div>
        )}
      </div>
    </article>
  )
}
