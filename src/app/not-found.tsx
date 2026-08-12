import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-10">
      <h1 className="font-display text-5xl md:text-7xl tracking-wider">
        404
      </h1>
      <p className="font-body text-center">
        That page does not exist.
      </p>
      <Link
        href="/"
        className="font-display tracking-wider px-6 py-2 bg-primary text-white border-4 border-black shadow-4xl shadow-secondary hover:bg-secondary transition-all ease-out"
      >
        Go Home
      </Link>
    </main>
  )
}
