"use client"

import React, { useState } from "react"
import { Cue } from "@/modules/rundown/types"
import { useRundown } from "@/context/RundownContext"
import { useCueCalculations } from "@/hooks/useCueCalculations"
import { createCue, deleteCue, updateCue, reorderCues } from "@/server/cueActions"
import CueRow from "./CueRow"

interface CueTableProps {
  rundownId: string
}

export default function CueTable({ rundownId }: CueTableProps) {
  const { cues, addCue, deleteCue: deleteCueLocal, reorderCues: reorderCuesLocal } = useRundown()
  const { formatSeconds, getTotalDuration } = useCueCalculations()
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleAddCue = async () => {
    const newOrder = (cues.length > 0 ? Math.max(...cues.map((c) => c.order)) : 0) + 1
    const newCue = await createCue({
      rundown_id: rundownId,
      segment_id: null,
      order: newOrder,
      title: "New Cue",
      duration_seconds: 0,
      color: "blue",
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
  }

  const handleUpdateCue = async (cueId: string, updates: Partial<Cue>) => {
    await updateCue(cueId, updates)
  }

  const handleDragStart = (cueId: string) => {
    setDraggedId(cueId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetCueId: string) => {
    if (!draggedId || draggedId === targetCueId) return

    const draggedCue = cues.find((c) => c.id === draggedId)!

    const newCues = [...cues]
    const draggedIndex = newCues.findIndex((c) => c.id === draggedId)
    const targetIndex = newCues.findIndex((c) => c.id === targetCueId)

    newCues.splice(draggedIndex, 1)
    newCues.splice(targetIndex, 0, draggedCue)

    // Recalculate orders
    const reorderedCues = newCues.map((cue, index) => ({
      ...cue,
      order: index + 1,
    }))

    await reorderCues(rundownId, reorderedCues.map((c) => c.id))
    reorderCuesLocal(reorderedCues)
    setDraggedId(null)
  }

  const sortedCues = [...cues].sort((a, b) => a.order - b.order)
  const totalDuration = getTotalDuration()

  return (
    <div className="space-y-4">
      {/* Header with total duration */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cues</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Total: {formatSeconds(totalDuration)}
          </span>
          <button
            onClick={handleAddCue}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            + Add Cue
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 w-12">#</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Title</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 w-16">Color</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 w-24">Duration</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 w-24">Camera</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 w-24">Audio</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 w-24">Graphics</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Notes</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700 w-24">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedCues.map((cue, index) => (
              <CueRow
                key={cue.id}
                cue={cue}
                index={index}
                onUpdate={handleUpdateCue}
                onDelete={handleDeleteCue}
                onDragStart={() => handleDragStart(cue.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(cue.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
