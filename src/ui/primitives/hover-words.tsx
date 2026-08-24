// The word-by-word hover effect under the legal pages. Was copy-pasted into
// both of them, and into a couple of the marketing sections before those were
// removed.
//
// A span per word rather than a <b>. The effect is a background on hover, and
// <b> is not how you ask for one — it marked the entire text of the privacy
// policy and the terms as emphasised, which is what a screen reader is told
// and what a search engine weighs.
export default function HoverWords({ children }: { children: string }) {
  return (
    <p className="px-10 pb-10 text-center font-body">
      {children.split(" ").map((word, index) => (
        <span key={index} className="hover:bg-secondary">{` ${word} `}</span>
      ))}
    </p>
  )
}
