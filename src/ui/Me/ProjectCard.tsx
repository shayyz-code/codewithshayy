import type { Project } from "@/data/projects"
import Image from "next/image"
import Link from "next/link"
import PrimaryBtn from "../PrimaryBtn"

export default function ProjectCard({ data }: { data: Project }) {
  return (
    <article className="group flex flex-col gap-5 max-w-[380px] bg-white/75 dark:bg-black/75 border-4 border-black pb-5 hover:shadow-3xl transform transition-all ease-out overflow-hidden shadow-3xl shadow-primary">
      <div className="w-[380px] h-[250px] overflow-y-hidden flex justify-center items-center bg-white">
        {data.mediaKey ? (
          <Image
            src={`/media/${data.mediaKey}`}
            priority={true}
            alt={`${data.title} preview`}
            width={250}
            height={250}
            className="transition-all ease-out transform group-hover:scale-110"
          />
        ) : (
          // No image on record. A titled placeholder beats a broken image box.
          <div className="w-full h-full flex items-center justify-center bg-primary/10 px-6">
            <span className="font-burbankblack text-center text-black tracking-wide">
              {data.title}
            </span>
          </div>
        )}
      </div>
      <div className="px-5">
        <ul className="flex flex-wrap gap-x-2 text-sm">
          {data.tags.map((tag) => (
            <li key={tag}>#{tag}</li>
          ))}
        </ul>
        <div>
          <h2 className="font-burbankblack text-xl mb-2">{data.title}</h2>
          {/* Both links are conditional: a missing site or a private repo used
              to render a link straight to a 404. */}
          {data.siteUrl && (
            <PrimaryBtn href={data.siteUrl} size="sm">
              Visit
            </PrimaryBtn>
          )}
          <p className="font-burbankmedium text-sm py-3">{data.description}</p>
          {data.repoUrl && (
            <Link className="text-sky-600" href={data.repoUrl}>
              Github &gt;
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
