import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useEffect, useState } from "react";

export type TCourse = {
  key: string;
  title: string;
  description: string;
  tags: string;
  slug: string;
  photo_url: string;
};

export type TCourseWithoutKey = {
  title: string;
  description: string;
  tags: string;
  slug: string;
  photo_url: string;
};

export const courseDefaultValues = {
  key: "",
  title: "",
  description: "",
  tags: "",
  slug: "",
  photo_url: "",
};

export type TCourseDetail = {
  key: string;
  title: string;
  taughtby: string;
  description: string;
  tags: string;
  slug: string;
  overview: string;
  prerequisites: string;
  techstacks: string;
  techstacksdescription: string;
  whatwillilearn: string;
  whatwillibuild: string;
  isthiscourserightforme: string;
  duration: string;
  photo_url: string;
};

export type TCourseDetailWithoutKey = {
  title: string;
  taughtby: string;
  description: string;
  tags: string;
  slug: string;
  overview: string;
  prerequisites: string;
  techstacks: string;
  techstacksdescription: string;
  whatwillilearn: string;
  whatwillibuild: string;
  isthiscourserightforme: string;
  duration: string;
  photo_url: string;
};

type TCourseContext = {
  isOpen: boolean;
  key: string;
  openSheet: (key: string) => void;
  closeSheet: () => void;
};

const courseContextDefaultValues = {
  isOpen: false,
  key: "",
  openSheet: (key: string) => {},
  closeSheet: () => {},
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openSheet = (key: string) => {
    if (!isOpen) {
      router.push(pathname + "?key=" + key);
    }
  };

  const closeSheet = () => {
    if (isOpen) {
      router.push(pathname + "");
    }
  };

  useEffect(() => {
    if (pathname === "/courses") {
      const courseKey = searchParams.get("key");
      if (courseKey !== null && courseKey !== "") {
        setIsOpen(true);
        setKey(courseKey);
      } else {
        setIsOpen(false);
        setKey("");
      }
    }
  }, [searchParams]);

  return (
    <CourseContext.Provider value={{ isOpen, key, openSheet, closeSheet }}>
      {children}
    </CourseContext.Provider>
  );
}
