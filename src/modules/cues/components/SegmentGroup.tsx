"use client"

import React, { useState } from "react"
import { Cue } from "@/modules/rundown/types"
import CueCard from "./CueCard"

interface SegmentGroupProps {
  segmentName: string
  cues: Cue[]
  onDragStart: (cueId: string) => void
  onDragOver: (cueId: string) => void
  onDragLeave: () => void
  onDragEnd: () => void
  onDrop: (targetCueId: string) => void
  onDelete: (cueId: string) => void
  isDragging: boolean
  draggedId: string | null
  dragOverId: string | null
}

export default function SegmentGroup({
  segmentName,
  cues,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
  onDelete,
  isDragging,
  draggedId,
  dragOverId,
}: SegmentGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (cues.length === 0) return null

  return (
    <div className="space-y-2">
      {/* Segment header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 rounded-lg transition-colors group"
      >
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-semibold text-gray-900">{segmentName}</span>
        <span className="text-xs text-gray-500 ml-auto">{cues.length} cues</span>
      </button>

      {/* Cues list */}
      {!isCollapsed && (
        <div className="ml-2 space-y-2 border-l-2 border-gray-200 pl-4">
          {cues.map((cue) => (
            <CueCard
              key={cue.id}
              cue={cue}
              isDragging={isDragging && draggedId === cue.id}
              isDragOver={dragOverId === cue.id}
              onDragStart={() => onDragStart(cue.id)}
              onDragOver={() => onDragOver(cue.id)}
              onDragLeave={onDragLeave}
              onDragEnd={onDragEnd}
              onDrop={() => onDrop(cue.id)}
              onDelete={() => onDelete(cue.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
