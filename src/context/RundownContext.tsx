import React, { createContext, useContext, useState, useCallback } from "react"
import { Rundown, Cue, Segment } from "@/modules/rundown/types"

export type RundownContextType = {
  rundown: Rundown | null
  cues: Cue[]
  segments: Segment[]
  activeRundownId: string | null
  activeCueId: string | null

  // Rundown actions
  setRundown: (rundown: Rundown) => void
  setActiveRundownId: (id: string | null) => void

  // Segment actions
  setSegments: (segments: Segment[]) => void
  addSegment: (segment: Segment) => void
  updateSegment: (segmentId: string, segment: Partial<Segment>) => void
  deleteSegment: (segmentId: string) => void
  reorderSegments: (segments: Segment[]) => void

  // Cue actions
  setCues: (cues: Cue[]) => void
  addCue: (cue: Cue) => void
  updateCue: (cueId: string, cue: Partial<Cue>) => void
  deleteCue: (cueId: string) => void
  reorderCues: (cues: Cue[]) => void
  setActiveCueId: (id: string | null) => void
}

const RundownContext = createContext<RundownContextType | undefined>(undefined)

export const RundownProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [rundown, setRundown] = useState<Rundown | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])
  const [cues, setCues] = useState<Cue[]>([])
  const [activeRundownId, setActiveRundownId] = useState<string | null>(null)
  const [activeCueId, setActiveCueId] = useState<string | null>(null)

  // Segment actions
  const addSegment = useCallback((segment: Segment) => {
    setSegments((prev) => [...prev, segment])
  }, [])

  const updateSegment = useCallback((segmentId: string, updates: Partial<Segment>) => {
    setSegments((prev) =>
      prev.map((seg) => (seg.id === segmentId ? { ...seg, ...updates } : seg))
    )
  }, [])

  const deleteSegment = useCallback((segmentId: string) => {
    setSegments((prev) => prev.filter((seg) => seg.id !== segmentId))
    // Remove segment_id from all cues in this segment
    setCues((prev) =>
      prev.map((cue) =>
        cue.segment_id === segmentId ? { ...cue, segment_id: null } : cue
      )
    )
  }, [])

  const reorderSegments = useCallback((newSegments: Segment[]) => {
    setSegments(newSegments)
  }, [])

  // Cue actions
  const addCue = useCallback((cue: Cue) => {
    setCues((prev) => [...prev, cue])
  }, [])

  const updateCue = useCallback((cueId: string, updates: Partial<Cue>) => {
    setCues((prev) =>
      prev.map((cue) => (cue.id === cueId ? { ...cue, ...updates } : cue))
    )
  }, [])

  const deleteCue = useCallback((cueId: string) => {
    setCues((prev) => prev.filter((cue) => cue.id !== cueId))
  }, [])

  const reorderCues = useCallback((newCues: Cue[]) => {
    setCues(newCues)
  }, [])

  const value: RundownContextType = {
    rundown,
    cues,
    segments,
    activeRundownId,
    activeCueId,
    setRundown,
    setActiveRundownId,
    setSegments,
    addSegment,
    updateSegment,
    deleteSegment,
    reorderSegments,
    setCues,
    addCue,
    updateCue,
    deleteCue,
    reorderCues,
    setActiveCueId,
  }

  return (
    <RundownContext.Provider value={value}>{children}</RundownContext.Provider>
  )
}

export const useRundown = () => {
  const context = useContext(RundownContext)
  if (!context) {
    throw new Error("useRundown must be used within RundownProvider")
  }
  return context
}
