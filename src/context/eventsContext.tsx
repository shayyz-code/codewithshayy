"use client";

import getAllEvents from "@/backend/getAllEvents";
import { createContext, ReactNode, useEffect, useState } from "react";

export type TEvent = {
  key: string;
  title: string;
  date: string;
  time: string;
  description: string;
  photo_url: string;
  register_link: string;
  role: string;
};

export const EventDefaultValues = {
  key: "",
  title: "",
  date: "",
  time: "",
  description: "",
  photo_url: "",
  register_link: "",
  role: "",
};

export type TEventWithoutKey = {
  title: string;
  date: string;
  time: string;
  description: string;
  photo_url: string;
  register_link: string;
  role: string;
};

const TContextEventsDefaultValues = [
  {
    key: "",
    title: "",
    date: "",
    time: "",
    description: "",
    photo_url: "",
    register_link: "",
    role: "",
  },
];

export const ContextEvents = createContext<TEvent[]>(
  TContextEventsDefaultValues
);

export default function ContextEventsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [events, setEvents] = useState<TEvent[]>([]);
  useEffect(() => {
    async function fetchData() {
      const data = await getAllEvents();
      if (data) {
        setEvents(data);
      }
    }

    fetchData();
  }, []);
  return (
    <ContextEvents.Provider value={events}>{children}</ContextEvents.Provider>
  );
}
