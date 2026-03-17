import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { Rundown, Cue, Segment } from "@/modules/rundown/types"

export type RundownContextType = {
  rundown: Rundown | null
  cues: Cue[]
  segments: Segment[]
  activeRundownId: string | null
  activeCueId: string | null
  isPlaying: boolean
  isLiveMode: boolean
  remainingSeconds: number
  currentCueIndex: number
  showStarted: boolean

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

  // Playback actions
  setIsPlaying: (playing: boolean) => void
  setIsLiveMode: (liveMode: boolean) => void
  setRemainingSeconds: (seconds: number) => void
  setCurrentCueIndex: (index: number) => void
  setShowStarted: (started: boolean) => void
  startShow: () => void
  goToNextCue: () => void
  goToPreviousCue: () => void
  clearShowProgress: () => void
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [currentCueIndex, setCurrentCueIndex] = useState(0)
  const [showStarted, setShowStarted] = useState(false)

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

  const startShow = useCallback(() => {
    if (cues.length > 0) {
      // Get the first cue's duration
      const firstCueDuration = cues[0].duration_seconds
      setCurrentCueIndex(0)
      setRemainingSeconds(firstCueDuration)
      setIsLiveMode(true)
      setIsPlaying(true)
      setShowStarted(true)
    }
  }, [cues])

  const goToNextCue = useCallback(() => {
    setCurrentCueIndex((prev) => {
      const nextIndex = prev + 1
      if (nextIndex < cues.length) {
        const nextCueDuration = cues[nextIndex].duration_seconds
        setRemainingSeconds(nextCueDuration)
        return nextIndex
      }
      return prev
    })
  }, [cues])

  const goToPreviousCue = useCallback(() => {
    setCurrentCueIndex((prev) => {
      const prevIndex = prev - 1
      if (prevIndex >= 0) {
        const prevCueDuration = cues[prevIndex].duration_seconds
        setRemainingSeconds(prevCueDuration)
        return prevIndex
      }
      return prev
    })
  }, [cues])

  const clearShowProgress = useCallback(() => {
    if (!activeRundownId) return
    const progressKey = `rundown_progress_${activeRundownId}`
    localStorage.removeItem(progressKey)
  }, [activeRundownId])

  // Save progress to localStorage when show is active
  useEffect(() => {
    if (!activeRundownId || !showStarted) return

    const progressKey = `rundown_progress_${activeRundownId}`
    const progress = {
      showStarted,
      currentCueIndex,
      remainingSeconds,
      isPlaying,
    }
    localStorage.setItem(progressKey, JSON.stringify(progress))
  }, [activeRundownId, showStarted, currentCueIndex, remainingSeconds, isPlaying])

  // Restore progress from localStorage when activeRundownId changes
  useEffect(() => {
    if (!activeRundownId) return

    const progressKey = `rundown_progress_${activeRundownId}`
    const savedProgress = localStorage.getItem(progressKey)

    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        setShowStarted(progress.showStarted)
        setCurrentCueIndex(progress.currentCueIndex)
        setRemainingSeconds(progress.remainingSeconds)
        setIsPlaying(progress.isPlaying)
        setIsLiveMode(progress.showStarted)
      } catch (error) {
        console.error("Error restoring progress:", error)
      }
    }
  }, [activeRundownId])

  const value: RundownContextType = {
    rundown,
    cues,
    segments,
    activeRundownId,
    activeCueId,
    isPlaying,
    isLiveMode,
    remainingSeconds,
    currentCueIndex,
    showStarted,
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
    setIsPlaying,
    setIsLiveMode,
    setRemainingSeconds,
    setCurrentCueIndex,
    setShowStarted,
    startShow,
    goToNextCue,
    goToPreviousCue,
    clearShowProgress,
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
