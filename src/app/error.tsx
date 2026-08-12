"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfaces in the Workers observability store, which is the only place
    // worker-side errors are visible.
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-10">
      <h1 className="font-display text-3xl md:text-5xl tracking-wider text-center">
        Something broke.
      </h1>
      <p className="font-body text-center">
        That is on me, not you.
      </p>
      <button
        onClick={reset}
        className="font-display tracking-wider px-6 py-2 bg-primary text-white border-4 border-black shadow-4xl shadow-secondary hover:bg-secondary transition-all ease-out"
      >
        Try Again
      </button>
    </main>
  )
}
