import { CourseContext, TCourse } from "@/context/courseContext"
import { cstlc } from "@/functions/convertStringToList"
import Image from "next/image"
import Link from "next/link"
import { useContext } from "react"

export default function CCard({
  data,
  isSpecificCourse = false,
}: {
  data: TCourse
  isSpecificCourse?: boolean
}) {
  const { openSheet } = useContext(CourseContext)
  return (
    <article className="group flex flex-col gap-5 max-w-[250px] bg-white/75 dark:bg-black/75 border-4 border-black pb-5 hover:shadow-3xl transform transition-all ease-out overflow-hidden shadow-3xl shadow-primary">
      <div className="w-[250px] h-[250px] overflow-y-hidden">
        <Image
          src={data.photo_url}
          priority={true}
          alt="picture of course"
          width={250}
          height={250}
          className="transition-all ease-out transform group-hover:scale-110"
        />
      </div>
      <div className="px-5">
        <ul className="flex gap-2 text-sm">
          {cstlc(data.tags).map((tag, index) => (
            <li key={index}>#{tag}</li>
          ))}
        </ul>
        <div>
          <h2 className="font-burbankblack text-2xl tracking-wider">
            {data.title}
          </h2>
          <p className="font-burbankmedium text-sm py-3">{data.description}</p>
          {!isSpecificCourse ? (
            <button
              onClick={() => openSheet(data.key)}
              className="text-sky-600"
            >
              Learn more &gt;
            </button>
          ) : (
            <Link className="text-sky-600" href={`/courses?key=${data.key}`}>
              Learn more &gt;
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
