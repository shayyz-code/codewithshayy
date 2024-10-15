"use client";

import { TEvent } from "@/context/eventsContext";
import { clto } from "@/functions/convertModel";
import Image from "next/image";

export default function RestEvent({ data }: { data: TEvent }) {
  return (
    <article className=" group max-w-[300px] flex flex-col flex-wrap border-4 border-black transform transition-all ease-out hover:-translate-y-2 hover:shadow-3xl hover:shadow-emerald-500 overflow-hidden">
      {data && data.photo_url && (
        <div className="overflow-y-hidden">
          <Image
            src={data.photo_url}
            alt="picture of course"
            width={300}
            height={300}
            className="transition-all ease-out transform group-hover:scale-110"
          />
        </div>
      )}
      {data.description ? (
        <div className="relative p-5 border-t-4 border-black">
          <Image
            src="/bg4.jpg"
            alt="comic bg"
            fill
            style={{ objectFit: "cover" }}
            className="-z-20"
          />
          <ul className="flex gap-2 text-xs">
            <li className="px-2 py-1 font-burbankmedium bg-white border-2 border-black text-black">
              Event
            </li>
          </ul>
          <div>
            <h2 className="font-burbankblack text-xl tracking-wider pt-2">
              {data.title}
            </h2>
            <div className="text-sm py-2">
              📅 Date: {data.date}
              <br />⏰ Time: [{data.time}]
            </div>
            <p className="text-base pb-1">
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
        </div>
      ) : (
        <div className="text-white">
          <ul className="flex gap-2 text-xs mb-3">
            <li className="px-2 py-1 bg-white border-2 font-burbankmedium border-black text-black">
              Event
            </li>
          </ul>
          <h2 className="font-burbankblack md:[w-500px] text-2xl md:text-3xl tracking-wider">
            No Event Found.
          </h2>
        </div>
      )}
    </article>
  );
}
