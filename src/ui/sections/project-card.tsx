import type { Project } from "@/data/projects"
import Image from "next/image"
import Link from "next/link"
import PrimaryBtn from "@/ui/primitives/primary-btn"

export default function ProjectCard({
  data,
  priority = false,
}: {
  data: Project
  /** Preload this card's image. True for the first card only — see below. */
  priority?: boolean
}) {
  const href = `/projects/${data.slug}`

  return (
    <article className="group flex flex-col gap-5 max-w-[380px] bg-white/75 dark:bg-black/75 border-4 border-black pb-5 hover:shadow-3xl transform transition-all ease-out overflow-hidden shadow-3xl shadow-primary">
      {/* Only the image and title link through to the detail page. Wrapping the
          whole card would nest the site and repo anchors inside it. */}
      <Link
        href={href}
        aria-label={data.title}
        className="w-[380px] h-[250px] overflow-y-hidden flex justify-center items-center bg-white"
      >
        {/* priority was true on every card, which is worse than none: each one
            emits a preload hint, and a dozen images all declared most important
            leaves the browser to pick. Only the first card is plausibly the LCP
            element, so ProjectGrid sets it on index 0 alone. */}
        {data.mediaKey ? (
          <Image
            src={`/media/${data.mediaKey}`}
            priority={priority}
            alt={`${data.title} preview`}
            width={250}
            height={250}
            // Cloudflare Images answers 403 "Blocked" for the 1 MB, 190-frame
            // rangoon-academy GIF, so animated sources skip the optimizer.
            unoptimized={data.mediaKey.toLowerCase().endsWith(".gif")}
            className="transition-all ease-out transform group-hover:scale-110"
          />
        ) : (
          // No image on record. A titled placeholder beats a broken image box.
          <div className="w-full h-full flex items-center justify-center bg-primary/10 px-6">
            <span className="font-display text-center text-black tracking-wide">
              {data.title}
            </span>
          </div>
        )}
      </Link>
      <div className="px-5">
        <ul className="flex flex-wrap gap-x-2 text-sm">
          {data.tags.map((tag) => (
            <li key={tag}>#{tag}</li>
          ))}
        </ul>
        <div>
          <h2 className="font-display text-xl mb-2">
            <Link
              href={href}
              className="hover:text-primary transition-all ease-out"
            >
              {data.title}
            </Link>
          </h2>
          {/* Both links are conditional: a missing site or a private repo used
              to render a link straight to a 404. */}
          {data.siteUrl && (
            <PrimaryBtn href={data.siteUrl} size="sm">
              Visit
            </PrimaryBtn>
          )}
          <p className="font-body text-sm py-3">{data.description}</p>
          <div className="flex items-center gap-4">
            <Link className="text-sky-600" href={href}>
              Read more &gt;
            </Link>
            {data.repoUrl && (
              <a
                className="text-sky-600"
                href={data.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Github &gt;
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
