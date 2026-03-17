"use client"

import React, { useState } from "react"
import { useRundown } from "@/context/RundownContext"
import { useCueCalculations } from "@/hooks/useCueCalculations"
import { createCue, deleteCue, reorderCues } from "@/server/cueActions"
import CueCard from "./CueCard"

interface CueListHorizontalProps {
  rundownId: string
}

interface DragState {
  draggedId: string | null
  dragOverId: string | null
  isDragging: boolean
}

export default function CueListHorizontal({ rundownId }: CueListHorizontalProps) {
  const { cues, addCue, deleteCue: deleteCueLocal, reorderCues: reorderCuesLocal, updateCue: updateCueLocal } = useRundown()
  const { formatSeconds, getTotalDuration } = useCueCalculations()
  const [dragState, setDragState] = useState<DragState>({
    draggedId: null,
    dragOverId: null,
    isDragging: false,
  })

  const handleAddCue = async () => {
    const newOrder = cues.length > 0 ? Math.max(...cues.map((c) => c.order)) + 1 : 1
    const newCue = await createCue({
      rundown_id: rundownId,
      segment_id: null,
      order: newOrder,
      title: "New Cue",
      duration_seconds: 0,
      color: null,
      notes: null,
      camera: null,
      multimedia: null,
      audio: null,
      graphics: null,
    })
    addCue(newCue)
  }

  const handleDeleteCue = async (cueId: string) => {
    await deleteCue(cueId)
    deleteCueLocal(cueId)
    
    // Renumber remaining cues sequentially
    const remainingCues = cues.filter(c => c.id !== cueId).sort((a, b) => a.order - b.order)
    const reorderedCues = remainingCues.map((cue, index) => ({
      ...cue,
      order: index + 1,
    }))
    
    if (reorderedCues.length > 0) {
      await reorderCues(rundownId, reorderedCues.map((c) => c.id))
      reorderCuesLocal(reorderedCues)
    }
  }

  const handleDragStart = (cueId: string) => {
    setDragState({
      draggedId: cueId,
      dragOverId: null,
      isDragging: true,
    })
  }

  const handleDragOver = (cueId: string) => {
    setDragState((prev) => ({
      ...prev,
      dragOverId: cueId,
    }))
  }

  const handleDragLeave = () => {
    setDragState((prev) => ({
      ...prev,
      dragOverId: null,
    }))
  }

  const handleDragEnd = () => {
    setDragState({
      draggedId: null,
      dragOverId: null,
      isDragging: false,
    })
  }

  const handleDrop = async (targetCueId: string) => {
    const { draggedId } = dragState
    if (!draggedId || draggedId === targetCueId) {
      setDragState({ draggedId: null, dragOverId: null, isDragging: false })
      return
    }

    const newCues = [...cues]
    const draggedIndex = newCues.findIndex((c) => c.id === draggedId)
    const targetIndex = newCues.findIndex((c) => c.id === targetCueId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const draggedCue = newCues[draggedIndex]
    newCues.splice(draggedIndex, 1)
    newCues.splice(targetIndex, 0, draggedCue)

    // Recalculate orders
    const reorderedCues = newCues.map((cue, index) => ({
      ...cue,
      order: index + 1,
    }))

    await reorderCues(rundownId, reorderedCues.map((c) => c.id))
    reorderCuesLocal(reorderedCues)

    setDragState({
      draggedId: null,
      dragOverId: null,
      isDragging: false,
    })
  }

  const sortedCues = [...cues].sort((a, b) => a.order - b.order)
  const totalDuration = getTotalDuration()

  return (
    <div className="flex flex-col w-full h-full gap-4">
      {/* Header with controls */}
      <div className="flex justify-between items-center px-4 pt-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Cues</h2>
          <p className="text-sm text-slate-400 mt-1">
            Total: <span className="font-mono font-semibold">{formatSeconds(totalDuration)}</span>
          </p>
        </div>

        <button
          onClick={handleAddCue}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Cue
        </button>
      </div>

      {/* Horizontal scroll container - scrollable table of rows */}
      <div className="flex-1 overflow-x-auto overflow-y-auto border-t border-slate-700 scrollbar-subtle">
        <div className="min-w-max w-max flex flex-col">
          {sortedCues.length > 0 ? (
            sortedCues.map((cue) => (
              <CueCard
                key={cue.id}
                cue={cue}
                isDragging={dragState.isDragging && dragState.draggedId === cue.id}
                isDragOver={dragState.dragOverId === cue.id}
                onDragStart={() => handleDragStart(cue.id)}
                onDragOver={() => handleDragOver(cue.id)}
                onDragLeave={handleDragLeave}
                onDragEnd={handleDragEnd}
                onDrop={() => handleDrop(cue.id)}
                onDelete={() => handleDeleteCue(cue.id)}
                onUpdate={updateCueLocal}
              />
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-96 text-center">
              <div>
                <p className="text-slate-400 mb-4">No cues yet</p>
                <button
                  onClick={handleAddCue}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create your first cue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
