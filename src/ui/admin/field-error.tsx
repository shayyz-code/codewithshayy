/**
 * The message a failed media action redirected back with.
 *
 * Shared by the project image field and both settings image fields, which are
 * the three forms whose failures used to be invisible — the actions threw, and
 * a thrown server action reaches the error boundary with its message stripped
 * in production.
 *
 * `role="alert"` because the message arrives after a navigation rather than in
 * the initial render, so a screen reader has no other reason to announce it.
 */
export default function FieldError({ message }: { message: string | null }) {
  if (!message) return null

  return (
    <p
      role="alert"
      className="font-body text-sm border-2 border-red-600 text-red-700 dark:text-red-400 px-3 py-2"
    >
      {message}
    </p>
  )
}
