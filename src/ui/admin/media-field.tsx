import Image from "next/image"
import { removeMediaAction, uploadMediaAction } from "@/app/admin/actions"
import FieldError from "@/ui/admin/field-error"

// Its own form, outside the main one. A nested form is invalid HTML, and
// uploading should not require the rest of the fields to be valid — nor should
// it discard unsaved edits to them, which a shared submit would do.
//
// Only rendered on the edit page: the key is derived from the slug, so the
// project has to exist first.
export default function MediaField({
  id,
  mediaKey,
  title,
  error = null,
}: {
  id: string
  mediaKey: string | null
  title: string
  /** Why the last attempt failed, from ?error. See uploadMediaAction. */
  error?: string | null
}) {
  return (
    <div className="flex flex-col gap-2 border-4 border-black dark:border-primary p-4">
      <span className="font-display text-sm tracking-wide">Image</span>

      <FieldError message={error} />

      {mediaKey ? (
        <div className="flex items-start gap-4">
          <div className="border-4 border-black bg-white shrink-0">
            <Image
              src={`/media/${mediaKey}`}
              alt={`${title} preview`}
              width={160}
              height={160}
              unoptimized={mediaKey.toLowerCase().endsWith(".gif")}
              className="w-40 h-auto"
            />
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <code className="text-xs font-mono break-all opacity-70">
              {mediaKey}
            </code>
            <form action={removeMediaAction.bind(null, id)}>
              <button
                type="submit"
                className="font-body text-xs border-2 border-current px-2 py-1 hover:bg-red-600 hover:text-white transition-all ease-out"
              >
                Remove image
              </button>
            </form>
          </div>
        </div>
      ) : (
        <p className="font-body text-sm opacity-70">
          No image. The card renders a titled placeholder instead.
        </p>
      )}

      <form
        // No encType: React sets multipart automatically for a function
        // action, and specifying it logs "They will get overridden."
        action={uploadMediaAction.bind(null, id)}
        className="flex flex-wrap items-center gap-3 pt-2"
      >
        <input
          type="file"
          name="image"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          required
          className="font-body text-sm"
        />
        <button
          type="submit"
          className="font-body text-xs border-2 border-current px-3 py-1 hover:bg-primary hover:text-white transition-all ease-out"
        >
          {mediaKey ? "Replace" : "Upload"}
        </button>
      </form>

      <span className="text-xs font-body opacity-60">
        png, jpeg, webp, avif or gif · 5 MB max. The key includes a content
        hash, because /media caches objects for a year as immutable — a replaced
        image needs a new key to be seen.
      </span>
    </div>
  )
}
