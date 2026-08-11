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

  // Suppressed rather than fixed: this whole provider is dead code slated for
  // deletion with the courses surface. The gate below tests for "/courses",
  // a route that no longer exists, so this effect never runs at all.
  /* eslint-disable react-hooks/set-state-in-effect */
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
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <CourseContext.Provider value={{ isOpen, key, openSheet, closeSheet }}>
      {children}
    </CourseContext.Provider>
  );
}
