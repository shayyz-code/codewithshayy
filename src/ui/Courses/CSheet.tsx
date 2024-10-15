import { CourseContext, TCourseDetail } from "@/context/courseContext";
import { motion, AnimatePresence } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import xcircle from "../icons/xcircle";
import Image from "next/image";
import getAllFromCourse from "@/backend/getAllFromCourse";
import { clto } from "@/functions/convertModel";
import { TModel } from "@/functions/convertModel";
import { cstlc, cstle } from "@/functions/convertStringToList";
import { techstacksMap } from "../icons/techstacks/techstacksMap";

export default function CSheet() {
  const [data, setData] = useState<TCourseDetail>();
  const { isOpen, key, closeSheet } = useContext(CourseContext);

  useEffect(() => {
    async function fetchData() {
      const data = await getAllFromCourse("courses", key);
      setData(data);
    }
    fetchData();
  }, [key]);
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { y: 0, height: "auto" },
            collapsed: { y: "100%", height: 0 },
          }}
          transition={{ type: "spring" }}
          className="fixed bottom-0 right-0 left-0 z-20 px-5 w-full max-h-[90vh] bg-white/65 dark:bg-black/65 backdropBlur"
        >
          <div className="flex justify-end pt-3">
            <span
              className="h-7 cursor-pointer transition-all ease-out transform hover:text-white dark:hover:text-black"
              onClick={() => closeSheet()}
            >
              {xcircle()}
            </span>
          </div>
          {data ? (
            <div className="flex flex-col">
              <div className="pb-5">
                <h3 className="font-burbankblack text-2xl md:text-4xl tracking-wider uppercase text-center">
                  {data.title}
                </h3>
                <p className="text-center font-burbankmedium text-xs">
                  {data.description}
                </p>
              </div>
              <div className="flex flex-col gap-20 items-center max-h-[80vh] pt-0 pb-10 overflow-y-scroll">
                <Image
                  src={data.photo_url}
                  priority={true}
                  alt="picture of course"
                  width={400}
                  height={400}
                  className="border-4 border-black"
                />
                <div className="font-burbankmedium px-10 py-6 bg-white border-4 border-black text-black">
                  Taught by{" "}
                  <span className="text-sky-600 ">{data.taughtby}</span>
                </div>
                <div className="flex flex-col items-center mb-10">
                  <h4 className="relative font-burbankblack text-2xl md:text-4xl tracking-wider uppercase text-center p-5 px-10 border-4 border-black">
                    <Image
                      src={`/bg2.jpg`}
                      alt="picture of mode"
                      fill={true}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                      className="-z-10"
                    />
                    Tech Stack
                  </h4>
                  <ul className="flex justify-center items-center gap-5 my-12">
                    {cstlc(data.techstacks).map((item, index) => {
                      const typedKey = item as keyof typeof techstacksMap;
                      return <li key={index}>{techstacksMap[typedKey]()}</li>;
                    })}
                  </ul>
                  <ul className="w-[400px] mt-10 text-justify flex flex-col gap-3">
                    {clto(data.techstacksdescription).map(
                      (item: TModel, index1: number) => {
                        return (
                          <li key={index1}>
                            <p>
                              <strong className="font-extrabold">
                                {item.key}
                              </strong>

                              {` ` + item.value}
                            </p>
                          </li>
                        );
                      }
                    )}
                  </ul>
                </div>
                <div className="flex flex-col items-center mb-10">
                  <h4 className="relative font-burbankblack text-2xl md:text-4xl tracking-wider uppercase text-center p-5 px-10 border-4 border-black">
                    <Image
                      src={`/bg4.jpg`}
                      alt="picture of mode"
                      fill
                      style={{ objectFit: "cover" }}
                      className="-z-10"
                    />
                    What will I learn?
                  </h4>
                  <div className="flex flex-col gap-5 w-[400px] mt-12">
                    {clto(data.whatwillilearn).map(
                      (item: TModel, index1: number) => {
                        return (
                          <div key={index1}>
                            <h5 className="font-burbankblack tracking-wider text-xl pb-4">
                              {item.key}
                            </h5>

                            <ul className="flex flex-col gap-2 px-5 list-disc">
                              {item.value.map((val: string, index2: number) => (
                                <li
                                  className="flex gap-2 text-sm text-gray-600 dark:text-slate-300"
                                  key={index2}
                                >
                                  <span>{val.slice(0, 2)}</span>
                                  <p>{val.slice(2, val.length)}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center mb-10">
                  <h4 className="relative font-burbankblack text-2xl md:text-4xl tracking-wider uppercase text-center p-5 px-10 border-4 border-black">
                    <Image
                      src={`/bg5.jpg`}
                      alt="picture of mode"
                      fill
                      style={{ objectFit: "cover" }}
                      className="-z-10"
                    />
                    What will I build?
                  </h4>
                  <div className="flex flex-col gap-5 w-[400px] mt-12">
                    {clto(data.whatwillibuild).map(
                      (item: TModel, index1: number) => {
                        return (
                          <div key={index1}>
                            <h5 className="font-burbankblack tracking-wider text-xl pb-4">
                              {item.key}
                            </h5>

                            <ul className="flex flex-col gap-2 px-5 list-disc">
                              {item.value.map((val: string, index2: number) => (
                                <li
                                  className="flex gap-2 text-sm text-gray-600 dark:text-slate-300"
                                  key={index2}
                                >
                                  <span>{val.slice(0, 2)}</span>
                                  <p>{val.slice(2, val.length)}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center mb-10">
                  <h4 className="relative font-burbankblack text-2xl md:text-4xl tracking-wider uppercase text-center p-5 px-10 border-4 border-black">
                    <Image
                      src={`/bg6.jpg`}
                      alt="picture of mode"
                      fill
                      style={{ objectFit: "cover" }}
                      className="-z-10"
                    />
                    Is this course right for me?
                  </h4>
                  <p className="w-[400px] text-justify m-12">
                    {data.isthiscourserightforme}
                  </p>
                </div>
                <div className="flex flex-col items-center mb-10">
                  <h4 className="relative font-burbankblack text-2xl md:text-4xl tracking-wider uppercase text-center p-5 border-4 border-black">
                    <Image
                      src={`/bg3.jpg`}
                      alt="picture of mode"
                      fill
                      style={{ objectFit: "cover" }}
                      className="-z-10"
                    />
                    How long will this course take?
                  </h4>
                  <p className="font-burbankblack px-5 py-3 text-xl tracking-widest text-sky-600 bg-white border-4 border-black mt-12">
                    {data.duration}
                  </p>
                </div>
                <div className="block w-32 h-32"></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-pulse">
              <div className="flex flex-col items-center gap-2 pb-10">
                <div className="w-[200px] h-10 bg-gray-500/50 dark:bg-gray-700/50 rounded"></div>
                <div className="w-[400px] h-6 bg-gray-500/50 dark:bg-gray-700/50 rounded"></div>
              </div>
              <div className="flex flex-col gap-20 items-center pt-10 pb-10">
                <div className="w-[400px] h-[400px] rounded-xl bg-gray-500/50 dark:bg-gray-700/50"></div>
                <div className="w-[300px] h-40 rounded-xl bg-gray-500/50 dark:bg-gray-700/50"></div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
