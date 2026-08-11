import { TProject } from "@/context/projectsContext"
import { cstlc } from "@/utils/convertStringToList"
import Image from "next/image"
import Link from "next/link"
import PrimaryBtn from "../PrimaryBtn"

export default function ProjectCard({
  data,
  isSpecificProject = false,
}: {
  data: TProject
  isSpecificProject?: boolean
}) {
  return (
    <article className="group flex flex-col gap-5 max-w-[380px] bg-white/75 dark:bg-black/75 border-4 border-black pb-5 hover:shadow-3xl transform transition-all ease-out overflow-hidden shadow-3xl shadow-primary">
      <div className="w-[380px] h-[250px] overflow-y-hidden flex justify-center bg-white">
        <Image
          src={data.photo_url}
          priority={true}
          alt="picture of project"
          width={250}
          height={250}
          // Cloudflare Images answers "Blocked" (403) for the 1 MB animated
          // rangoon-academy GIF, so animated sources bypass the optimizer.
          // Matched before the query string — Firebase Storage URLs end in
          // ?alt=media&token=..., not the extension. Drop this once the
          // migration re-encodes the GIF as a static image.
          unoptimized={/\.gif(\?|$)/i.test(data.photo_url ?? "")}
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
          <h2 className="font-burbankblack text-xl mb-2">{data.title}</h2>
          <PrimaryBtn href={data.site} size="sm">
            Visit
          </PrimaryBtn>
          <p className="font-burbankmedium text-sm py-3">{data.description}</p>
          <Link
            className="text-sky-600"
            href={`https://github.com/shayyz-code/${data.slug}`}
          >
            Github &gt;
          </Link>
        </div>
      </div>
    </article>
  )
}
