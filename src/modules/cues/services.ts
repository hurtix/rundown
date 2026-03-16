import { Cue } from "../rundown/types"

// Sort cues by order
export function sortCuesByOrder(cues: Cue[]): Cue[] {
  return [...cues].sort((a, b) => a.order - b.order)
}

// Find next available order number
export function getNextOrder(cues: Cue[]): number {
  if (cues.length === 0) return 1
  const maxOrder = Math.max(...cues.map((c) => c.order))
  return maxOrder + 1
}
