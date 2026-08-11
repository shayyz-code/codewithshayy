// The word-by-word hover effect used under the legal pages. Was copy-pasted
// into both of them, and into a couple of the marketing sections before those
// were removed.
export default function HoverWords({ children }: { children: string }) {
  return (
    <p className="px-10 pb-10 text-center font-burbankmedium">
      {children.split(" ").map((word, index) => (
        <b key={index} className="hover:bg-secondary">{` ${word} `}</b>
      ))}
    </p>
  )
}
