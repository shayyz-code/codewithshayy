import Image from "next/image"
import Link from "next/link"
import type { Project } from "@/data/projects"
import Markdown from "@/ui/primitives/markdown"
import PrimaryBtn from "@/ui/primitives/primary-btn"

// A server component: Markdown renders on the server, so react-markdown never
// ships to the browser.
export default function ProjectDetail({ project }: { project: Project }) {
  const meta = [project.role, project.year].filter(Boolean).join(" · ")

  return (
    <article className="flex flex-col px-5 py-28 md:py-32 items-center">
      <div className="w-full max-w-2xl">
        <header className="border-b-4 border-black dark:border-primary pb-6">
          {project.tags.length > 0 && (
            <ul className="flex flex-wrap gap-x-2 text-sm">
              {project.tags.map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
          )}
          <h1 className="font-burbankblack text-3xl md:text-4xl tracking-wider mt-1">
            {project.title}
          </h1>
          {meta && (
            <p className="font-burbankmedium text-xs mt-1">{meta}</p>
          )}
          <p className="font-burbankmedium mt-3">{project.description}</p>

          {/* Both links are conditional: two repos are private and one does
              not exist, and not every project has a live site. */}
          {(project.siteUrl || project.repoUrl) && (
            <div className="flex items-center gap-5 mt-5">
              {project.siteUrl && (
                <PrimaryBtn href={project.siteUrl} size="sm">
                  Visit
                </PrimaryBtn>
              )}
              {project.repoUrl && (
                <Link className="text-sky-600" href={project.repoUrl}>
                  Github &gt;
                </Link>
              )}
            </div>
          )}
        </header>

        {project.mediaKey && (
          <div className="my-10 flex justify-center border-4 border-black bg-white">
            <Image
              src={`/media/${project.mediaKey}`}
              alt={`${project.title} preview`}
              width={640}
              height={640}
              priority
              className="w-full h-auto max-h-[420px] object-contain"
            />
          </div>
        )}

        {project.bodyMd ? (
          <Markdown>{project.bodyMd}</Markdown>
        ) : (
          <p className="font-burbankmedium text-sm mt-10 opacity-70">
            A longer write-up is coming.
          </p>
        )}

        <Link
          href="/projects"
          className="inline-block font-burbankblack tracking-wider mt-12 text-sky-600"
        >
          &lt; All projects
        </Link>
      </div>
    </article>
  )
}
