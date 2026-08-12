import type { Metadata } from "next"
import HoverWords from "@/ui/primitives/hover-words"

export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
  title: "Privacy — Code w/ Shayy",
  description: "What this site collects, which is almost nothing.",
}

export default function PagePrivacyPolicy() {
  return (
    <main className="">
      <section className="flex flex-col">
        <div className="flex flex-col items-center py-28 md:py-40 gap-5">
          <div className="overflow-hidden flex flex-col gap-5 px-10 py-5 w-[350px] md:w-full md:max-w-2xl shadow-2xl shadow-orange-600 border-4 border-black">
            <h1 className="font-burbankblack text-3xl tracking-wider text-center my-5">
              Privacy
            </h1>
            <p className="text-justify">
              <strong>Code w/ Shayy</strong> is my personal portfolio. It is a
              place to read about projects I have built, not a service you sign
              up for, so there is very little to say here — but what there is,
              I would rather say plainly.
            </p>

            <h2 className="text-lg font-extrabold">What this site collects</h2>
            <p className="text-justify">
              Nothing you type, because there is nowhere to type anything. There
              are no accounts, no sign-up forms, no comments and no newsletter.
              I do not set cookies and I do not run advertising or third-party
              tracking scripts.
            </p>
            <p className="text-justify">
              The site is hosted on Cloudflare, which records ordinary server
              logs — IP address, user agent, which page was requested — as part
              of serving and protecting the site. That is standard for any
              website, I do not link it to a person, and I do not build profiles
              from it.
            </p>

            <h2 className="text-lg font-extrabold">If you email me</h2>
            <p className="text-justify">
              Then I have your email and whatever you wrote in it, in my inbox,
              the same as any other email. I use it to reply to you. I will not
              add you to a mailing list or pass it on to anyone.
            </p>

            <h2 className="text-lg font-extrabold">Leaving the site</h2>
            <p className="text-justify">
              Project cards link out to live sites, app stores and GitHub. Once
              you follow one of those links you are on someone else&apos;s site,
              under their privacy policy, not mine.
            </p>

            <h2 className="text-lg font-extrabold">Changes</h2>
            <p className="text-justify">
              If this ever changes — say I add a contact form or analytics — I
              will update this page to describe what actually happens, rather
              than leaving text here that no longer matches reality.
            </p>
          </div>
        </div>
        <HoverWords>
          Questions about any of this? Email me and ask.
        </HoverWords>
      </section>
    </main>
  )
}
