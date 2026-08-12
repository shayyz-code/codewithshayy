import type { Metadata } from "next"
import HoverWords from "@/ui/primitives/hover-words"

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: "Terms — Code w/ Shayy",
  description: "The terms for using this site.",
}

export default function PageTermsAndConditions() {
  return (
    <main className="">
      <section className="flex flex-col">
        <div className="flex flex-col items-center py-28 md:py-40 gap-5">
          <div className="overflow-hidden flex flex-col gap-5 px-10 py-5 w-[350px] md:w-full md:max-w-2xl shadow-2xl shadow-orange-600 border-4 border-black">
            <h1 className="font-burbankblack text-3xl tracking-wider text-center my-5">
              Terms
            </h1>
            <p className="text-justify">
              <strong>Code w/ Shayy</strong> is my personal portfolio. Nothing
              is sold here and there is nothing to sign up for, so these terms
              are short.
            </p>

            <h2 className="text-lg font-extrabold">Using the site</h2>
            <p className="text-justify">
              Read it, share it, link to it. You do not need permission to link
              to any page here.
            </p>

            <h2 className="text-lg font-extrabold">What is mine</h2>
            <div>
              <ul className="flex flex-col gap-2 list-disc">
                <li>
                  The writing, design and images on this site are mine. Quote a
                  reasonable amount with credit; do not republish a page
                  wholesale as your own.
                </li>
                <li>
                  Project code is a separate matter. Where a project is public
                  on GitHub, its own licence governs it — that licence wins over
                  anything on this page.
                </li>
                <li>
                  Some projects were built for or with other people, and their
                  logos and product names belong to them, not to me.
                </li>
              </ul>
            </div>

            <h2 className="text-lg font-extrabold">Accuracy</h2>
            <p className="text-justify">
              Project descriptions reflect what I built and when. Things I do
              not control move on: a site goes down, a company rebrands, a link
              rots. I fix those when I notice them, but I cannot promise
              everything here is current.
            </p>

            <h2 className="text-lg font-extrabold">Liability</h2>
            <p className="text-justify">
              This site is provided as is. If you take an idea, a snippet or an
              approach from here and it does not work out, that is on you to
              verify before you rely on it.
            </p>

            <h2 className="text-lg font-extrabold">Changes</h2>
            <p className="text-justify">
              I may update this page. There is no account to notify, so the
              current version is whatever is on this page.
            </p>
          </div>
        </div>
        <HoverWords>
          Questions? Email me at aungminkhant.shay@gmail.com
        </HoverWords>
      </section>
    </main>
  )
}
