"use client";
import { useContext } from "react";
import LatestEvent from "./LatestEvent";
import RestEvent from "./RestEvent";
import UpcomingEvent from "./UpcomingEvent";
import { ContextEvents, EventDefaultValues } from "@/context/eventsContext";
import { motion } from "framer-motion";

export default function Events() {
  const events = useContext(ContextEvents);
  const upcomingEvent =
    events.find((event) => event.role === "upcoming") || EventDefaultValues;
  const latestEvent =
    events.find((event) => event.role === "latest") || EventDefaultValues;
  return (
    <section className="flex flex-col">
      <UpcomingEvent data={upcomingEvent} />
      <LatestEvent data={latestEvent} />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className="flex flex-wrap gap-5 gap-y-10 justify-around p-5 py-10"
      >
        {events
          .filter((event) => event.role === "rest")
          .map((event) => (
            <RestEvent key={event.key} data={event} />
          ))}
      </motion.div>
    </section>
  );
}
