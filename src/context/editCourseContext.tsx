"use client";

import { createContext, SetStateAction, useState } from "react";

type TContextEditCourse = {
  key: string;
  setKey: React.Dispatch<SetStateAction<string>>;
};

const ContextEditCourseDefaultValues = {
  key: "",
  setKey: () => {},
};

export const ContextEditCourse = createContext<TContextEditCourse>(
  ContextEditCourseDefaultValues
);

export default function EditCourseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [key, setKey] = useState<string>("");
  return (
    <ContextEditCourse.Provider value={{ key, setKey }}>
      {children}
    </ContextEditCourse.Provider>
  );
}
