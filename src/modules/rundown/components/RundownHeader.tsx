"use client"

import React from "react"
import { Rundown } from "@/modules/rundown/types"
import { useRundown } from "@/context/RundownContext"
import LiveHeader from "./LiveHeader"

interface RundownHeaderProps {
  rundown: Rundown
}

export default function RundownHeader({ rundown }: RundownHeaderProps) {
  const { startShow, setIsPlaying, isPlaying, remainingSeconds, setIsLiveMode, cues, currentCueIndex, setCurrentCueIndex, setShowStarted, clearShowProgress } = useRundown()

  const formatElapsedTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getTotalDuration = () => {
    return cues.reduce((total, cue) => total + (cue.duration_seconds || 0), 0)
  }

  const handleStartShow = () => {
    startShow()
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentCueIndex(0)
    setShowStarted(false)
    clearShowProgress()
  }

  const currentCueDuration = cues[currentCueIndex]?.duration_seconds || 0
  const totalDuration = getTotalDuration()

  return (
    <LiveHeader
      rundownTitle={rundown.title}
      elapsedTime={formatElapsedTime(remainingSeconds)}
      isPlaying={isPlaying}
      onPlayPause={handlePlayPause}
      onReset={handleReset}
      onStartShow={handleStartShow}
      currentCueDuration={currentCueDuration}
      remainingSeconds={remainingSeconds}
      totalDuration={totalDuration}
    />
  )
}
