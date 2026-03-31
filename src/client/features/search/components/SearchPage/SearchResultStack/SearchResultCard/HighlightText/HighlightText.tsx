import type { Segment } from "../../../../../services/search"

interface Props {
  segments: Segment[]
}

/**
 * Renders a list of text segments.
 * Highlighted segments are underlined — no background color change.
 */
export function HighlightText({ segments }: Props) {
  return (
    <>
      {segments.map((seg, i) =>
        seg.highlighted ? (
          <span
            key={i}
            className="underline decoration-primary decoration-2 underline-offset-2 font-medium"
          >
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  )
}
