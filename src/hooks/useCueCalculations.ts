import { useCallback } from "react"
import { Cue } from "@/modules/rundown/types"
import { useRundown } from "@/context/RundownContext"

export function useCueCalculations() {
  const { cues } = useRundown()

  // Calculate total duration and cue times
  const calculateCueTimes = useCallback((cuesToCalculate: Cue[]) => {
    const sorted = [...cuesToCalculate].sort((a, b) => a.order - b.order)

    return sorted.map((cue) => {
      const indexBefore = sorted.findIndex((c) => c.order === cue.order)
      const startTime = sorted
        .slice(0, indexBefore)
        .reduce((sum, c) => sum + c.duration_seconds, 0)

      return {
        ...cue,
        start_time_seconds: startTime,
        end_time_seconds: startTime + cue.duration_seconds,
      }
    })
  }, [])

  // Format seconds to HH:MM:SS
  const formatSeconds = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [hours, minutes, secs]
      .map((val) => String(val).padStart(2, "0"))
      .join(":")
  }, [])

  // Calculate total duration
  const getTotalDuration = useCallback((): number => {
    return cues.reduce((sum, cue) => sum + cue.duration_seconds, 0)
  }, [cues])

  // Get all cues with calculated times
  const getCuesWithTimes = useCallback(() => {
    return calculateCueTimes(cues)
  }, [cues, calculateCueTimes])

  return {
    calculateCueTimes,
    formatSeconds,
    getTotalDuration,
    getCuesWithTimes,
  }
}
