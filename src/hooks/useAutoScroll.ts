import { useEffect, useRef } from "react"

export function useAutoScroll(targetId: string | null) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!targetId || !containerRef.current) return

    const element = containerRef.current.querySelector(
      `[data-cue-id="${targetId}"]`
    )
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [targetId])

  return { containerRef }
}
