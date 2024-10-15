"use client";

import getUpcomingEvent from "@/backend/getUpcomingEvent";
import { EventDefaultValues, TEvent } from "@/context/eventsContext";
import { clto } from "@/functions/convertModel";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import PrimaryBtn from "../PrimaryBtn";

export default function CanvasUpcomingEvent() {
  const [event, setEvent] = useState<TEvent>(EventDefaultValues);
  useEffect(() => {
    async function fetchevent() {
      const event = await getUpcomingEvent();
      if (event) {
        setEvent(event);
      }
    }
    fetchevent();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="relative group flex flex-col md:flex-row justify-center gap-5 lg:gap-10 border-y-8 p-10 border-black overflow-hidden"
    >
      <Image
        src="/bg6.jpg"
        alt="comic bg"
        fill
        style={{ objectFit: "cover" }}
        className="-z-20"
      />
      {event && event.photo_url && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="mx-auto"
        >
          <Image
            src={event.photo_url}
            alt="picture of course"
            width={500}
            height={500}
            className="shadow-2xl shadow-pink-500 mb-5 md:mb-0 border-4 border-black"
          />
        </motion.div>
      )}

      {event.description ? (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
        >
          <ul className="flex gap-2 text-xs">
            <li className="px-2 py-1 font-burbankmedium bg-white border-2 border-black text-black">
              Upcoming Event
            </li>
          </ul>
          <div>
            <h2 className="font-burbankblack text-2xl tracking-wider pt-2">
              {event.title}
            </h2>
            <div className="font-burbankmedium py-2">
              📅 Date: {event.date}
              <br />⏰ Time: [{event.time}]
            </div>
            <p className="text-base pb-1 font-burbankmedium mb-3">
              {clto(event.description).map((item, index) => {
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
            <PrimaryBtn href={event.register_link} size="sm">
              Register
            </PrimaryBtn>
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
              Upcoming Event
            </li>
          </ul>
          <h2 className="font-burbankblack md:[w-500px] text-2xl md:text-3xl tracking-wider">
            No Upcoming Event Yet.
          </h2>
        </motion.div>
      )}
    </motion.div>
  );
}
