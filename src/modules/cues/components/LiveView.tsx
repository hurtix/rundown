"use client"

import React, { useState, useEffect } from "react"
import { Cue } from "@/modules/rundown/types"
import { useRundown } from "@/context/RundownContext"
import { useCueCalculations } from "@/hooks/useCueCalculations"
import { useAutoScroll } from "@/hooks/useAutoScroll"
import LiveControls from "./LiveControls"

interface LiveViewProps {
  cues: Cue[]
}

export default function LiveView({ cues }: LiveViewProps) {
  const { activeCueId, setActiveCueId } = useRundown()
  const { formatSeconds } = useCueCalculations()
  const { containerRef } = useAutoScroll(activeCueId)
  const [currentTime, setCurrentTime] = useState(0)

  // Timer para el cue activo
  useEffect(() => {
    const activeCue = cues.find((c) => c.id === activeCueId)
    if (!activeCue) return

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= activeCue.duration_seconds) {
          return 0 // Reset when done
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeCueId, cues])

  const sortedCues = [...cues].sort((a, b) => a.order - b.order)
  const activeCueIndex = sortedCues.findIndex((c) => c.id === activeCueId)
  const activeCue = sortedCues[activeCueIndex]

  const handleNextCue = () => {
    if (activeCueIndex < sortedCues.length - 1) {
      setActiveCueId(sortedCues[activeCueIndex + 1].id)
      setCurrentTime(0)
    }
  }

  const handlePreviousCue = () => {
    if (activeCueIndex > 0) {
      setActiveCueId(sortedCues[activeCueIndex - 1].id)
      setCurrentTime(0)
    }
  }

  const handleStartCue = (cueId: string) => {
    setActiveCueId(cueId)
    setCurrentTime(0)
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header with current cue info */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-4xl mx-auto">
          {activeCue ? (
            <>
              <div className="text-lg text-gray-400 mb-2">
                Cue {activeCueIndex + 1} / {sortedCues.length}
              </div>
              <h1 className="text-4xl font-bold">{activeCue.title}</h1>
              <div className="mt-4 flex gap-8 text-lg">
                <div>
                  <div className="text-gray-400">Duration</div>
                  <div className="text-2xl font-mono">
                    {formatSeconds(activeCue.duration_seconds)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Elapsed</div>
                  <div className="text-2xl font-mono">{formatSeconds(currentTime)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Remaining</div>
                  <div className="text-2xl font-mono">
                    {formatSeconds(Math.max(0, activeCue.duration_seconds - currentTime))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-400">No cue selected. Select one to start.</div>
          )}
        </div>
      </div>

      {/* Controls */}
      <LiveControls
        onNext={handleNextCue}
        onPrevious={handlePreviousCue}
        canNext={activeCueIndex < sortedCues.length - 1}
        canPrevious={activeCueIndex > 0}
      />

      {/* Cue list with auto-scroll */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-4 scrollbar-subtle"
      >
        <div className="max-w-2xl mx-auto space-y-2">
          {sortedCues.map((cue, index) => {
            const isActive = cue.id === activeCueId
            const isNext = index === activeCueIndex + 1
            const isPassed = index < activeCueIndex

            return (
              <div
                key={cue.id}
                data-cue-id={cue.id}
                onClick={() => handleStartCue(cue.id)}
                className={`p-4 rounded-lg cursor-pointer transition relative ${
                  isActive
                    ? "bg-green-600 ring-2 ring-green-400 shadow-lg"
                    : isNext
                    ? "bg-yellow-600 ring-2 ring-yellow-400 shadow-lg"
                    : isPassed
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-300">Cue {index + 1}</span>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-green-700 text-green-100 text-xs font-bold rounded">
                          CURRENT
                        </span>
                      )}
                      {isNext && (
                        <span className="px-2 py-0.5 bg-yellow-700 text-yellow-100 text-xs font-bold rounded">
                          NEXT
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-semibold">{cue.title}</div>
                    {cue.notes && (
                      <div className="text-sm text-gray-400 mt-1">{cue.notes}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-300">Duration</div>
                    <div className="text-xl font-mono">
                      {formatSeconds(cue.duration_seconds)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
