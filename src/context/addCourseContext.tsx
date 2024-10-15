import { createContext, useState } from "react";

export type TAddCourse = {
  key: string;
  title: string;
  taughtby: string;
  description: string;
  slug: string;
  overview: string;
  prerequisites: string;
  tags: string;
  techstacks: string;
  techstacksdescription: string;
  whatwillilearn: string;
  whatwillibuild: string;
  isthiscourserightforme: string;
  duration: string;
  photo_url: string;
};

export type TAddCourseWithoutKey = {
  title: string;
  taughtby: string;
  description: string;
  slug: string;
  overview: string;
  prerequisites: string;
  tags: string;
  techstacks: string;
  techstacksdescription: string;
  whatwillilearn: string;
  whatwillibuild: string;
  isthiscourserightforme: string;
  duration: string;
  photo_url: string;
};

export const addCourseDefaultValues = {
  key: "",
  title: "",
  description: "",
  slug: "",
  overview: "",
  prerequisites: "",
  tags: [],
  techstacks: "",
  techstacksdescription: "",
  whatwillilearn: "",
  whatwillibuild: "",
  isthiscourserightforme: "",
  duration: "",
  photo_url: "",
};

export type TCourseDetail = {
  key: string;
  title: string;
  description: string[];
  tags: string[];
  slug: string;
  photo_url: string;
  whatwillilearn: {
    [key: string]: string[];
  };
  whatwillibuld: {
    [key: string]: string[];
  };
};

export type TCourseDetailWithoutKey = {
  title: string;
  description: string[];
  tags: string[];
  slug: string;
  photo_url: string;
  whatwillilearn: {
    [key: string]: string[];
  };
  whatwillibuld: {
    [key: string]: string[];
  };
};

type TCourseContext = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  key: string;
  setKey: React.Dispatch<React.SetStateAction<string>>;
};

const courseContextDefaultValues = {
  isOpen: false,
  setIsOpen: () => {},
  key: "",
  setKey: () => {},
};

export const CourseContext = createContext<TCourseContext>(
  courseContextDefaultValues
);

type TProps = {
  children: React.ReactNode;
};

export function CourseProvider({ children }: TProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [key, setKey] = useState<string>("");
  return (
    <CourseContext.Provider value={{ isOpen, setIsOpen, key, setKey }}>
      {children}
    </CourseContext.Provider>
  );
}
