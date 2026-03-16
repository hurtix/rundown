import { Cue } from "./types"

// Calculate start and end times for all cues
export function calculateCueTimes(cues: Cue[]) {
  const sortedCues = [...cues].sort((a, b) => a.order - b.order)
  
  return sortedCues.map((cue) => {
    const indexBefore = sortedCues.findIndex((c) => c.order === cue.order)
    const startTime = sortedCues
      .slice(0, indexBefore)
      .reduce((sum, c) => sum + c.duration_seconds, 0)
    
    return {
      ...cue,
      start_time_seconds: startTime,
      end_time_seconds: startTime + cue.duration_seconds,
    }
  })
}

// Format seconds to HH:MM:SS
export function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  return [hours, minutes, secs]
    .map((val) => String(val).padStart(2, "0"))
    .join(":")
}

// Parse HH:MM:SS to seconds
export function parseSeconds(timeStr: string): number {
  const parts = timeStr.split(":").map(Number)
  if (parts.length !== 3) return 0
  
  const [hours, minutes, seconds] = parts
  return hours * 3600 + minutes * 60 + seconds
}

// Calculate total duration from all cues
export function calculateTotalDuration(cues: Cue[]): number {
  return cues.reduce((sum, cue) => sum + cue.duration_seconds, 0)
}
