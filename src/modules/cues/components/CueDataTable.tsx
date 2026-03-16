"use client"

import React, { useState, useMemo, useEffect } from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useRundown } from "@/context/RundownContext"
import { useCueCalculations } from "@/hooks/useCueCalculations"
import { createCue, deleteCue, reorderCues } from "@/server/cueActions"
import { DraggableRow } from "./DraggableRow"
import { CogIcon } from "lucide-react"

interface CueDataTableProps {
  rundownId: string
}

export function CueDataTable({ rundownId }: CueDataTableProps) {
  const { cues, rundown, addCue, deleteCue: deleteCueLocal, reorderCues: reorderCuesLocal, updateCue: updateCueLocal, isPlaying, remainingSeconds, setRemainingSeconds, currentCueIndex, setCurrentCueIndex } = useRundown()
  const { formatSeconds, getTotalDuration } = useCueCalculations()

  const [data, setData] = useState<typeof cues>([])

  // Sync local data with context cues
  useEffect(() => {
    setData([...cues].sort((a, b) => a.order - b.order))
  }, [cues])

  // Countdown timer
  useEffect(() => {
    if (!isPlaying || remainingSeconds <= 0) return

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, remainingSeconds, setRemainingSeconds])

  // Auto-advance to next cue when current reaches 0
  useEffect(() => {
    if (!isPlaying || remainingSeconds !== 0) return

    // Move to next cue
    if (currentCueIndex < data.length - 1) {
      const nextIndex = currentCueIndex + 1
      const nextCue = data[nextIndex]
      setCurrentCueIndex(nextIndex)
      setRemainingSeconds(nextCue.duration_seconds)
    } else {
      // Reached the end, stop playing
      setRemainingSeconds(0)
    }
  }, [remainingSeconds, isPlaying, currentCueIndex, data, setCurrentCueIndex, setRemainingSeconds])

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data])

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
    setData((prev) => [...prev, newCue].sort((a, b) => a.order - b.order))
  }

  const handleDeleteCue = async (cueId: string) => {
    await deleteCue(cueId)
    deleteCueLocal(cueId)
    
    // Filter out deleted cue and recalculate orders
    const remainingCues = data.filter(c => c.id !== cueId).sort((a, b) => a.order - b.order)
    const reorderedCues = remainingCues.map((cue, index) => ({
      ...cue,
      order: index + 1,
    }))
    
    if (reorderedCues.length > 0) {
      await reorderCues(rundownId, reorderedCues.map((c) => c.id))
      reorderCuesLocal(reorderedCues)
    }
    
    setData(reorderedCues)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (!over || active.id === over.id) return
    
    setData((data) => {
      const oldIndex = dataIds.indexOf(active.id)
      const newIndex = dataIds.indexOf(over.id)
      return arrayMove(data, oldIndex, newIndex)
    })

    // After reordering, recalculate order values and persist
    setData((prevData) => {
      const reorderedCues = prevData.map((cue, index) => ({
        ...cue,
        order: index + 1,
      }))
      
      // Persist to database
      reorderCues(rundownId, reorderedCues.map((c) => c.id))
      reorderCuesLocal(reorderedCues)
      
      return reorderedCues
    })
  }

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

      {/* Table container with drag and drop context */}
      <div className="flex flex-col flex-1 min-h-0">
        {data.length > 0 ? (
          <>
            {/* Table Headers - Sticky without overflow parent */}
            <div className="sticky top-0 z-50 bg-black overflow-x-auto">
              <div className="min-w-max flex gap-1 p-0.5 items-center min-h-[50px] w-full">
                {/* Drag Handle Column */}
                <div className="w-8 flex-none" />
                
                {/* Order Column */}
                <div className="w-12 flex-none flex items-center justify-center text-xs font-semibold text-slate-300 uppercase">
                  #
                </div>
                
                {/* Title Column */}
                <div className="flex-1 w-[500px] px-4 text-xs font-semibold text-slate-300 uppercase">
                  Title
                </div>
                
                {/* Start Time Column */}
                <div className="w-32 flex-none text-xs font-semibold text-slate-300 uppercase text-center">
                  Start Time
                </div>
                
                {/* Duration Column */}
                <div className="w-24 flex-none text-xs font-semibold text-slate-300 uppercase text-center">
                  Duration
                </div>
                
                {/* Camera Column */}
                <div className="w-48 flex-none px-2 text-xs font-semibold text-slate-300 uppercase">
                  Camera
                </div>
                
                {/* Multimedia Column */}
                <div className="w-48 flex-none px-2 text-xs font-semibold text-slate-300 uppercase">
                  Multimedia
                </div>
                
                {/* Audio Column */}
                <div className="w-48 flex-none px-2 text-xs font-semibold text-slate-300 uppercase">
                  Audio
                </div>
                
                {/* Graphics Column */}
                <div className="w-48 flex-none px-2 text-xs font-semibold text-slate-300 uppercase">
                  Graphics
                </div>
                
                {/* Notes Column */}
                <div className="w-64 flex-none px-2 text-xs font-semibold text-slate-300 uppercase">
                  Notes
                </div>
                
                {/* Actions Column */}
                <div className="w-8 flex-none text-xs font-semibold text-slate-300 uppercase text-center">
                  <CogIcon className="w-4 h-4" />
                </div>
              </div>
            </div>
            
            {/* Rows Container - Only this has overflow */}
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
                sensors={sensors}
                id={sortableId}
              >
                <div className="min-w-max w-max flex flex-col">
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {data.map((cue, index) => (
                      <DraggableRow
                        key={cue.id}
                        cue={cue}
                        rundownStartTime={rundown?.event_date}
                        allCues={data}
                        onDelete={() => handleDeleteCue(cue.id)}
                        onUpdate={updateCueLocal}
                        isCurrentCue={index === currentCueIndex}
                        isNextCue={index === currentCueIndex + 1}
                        isPassed={index < currentCueIndex}
                        countdownSeconds={index === currentCueIndex && isPlaying ? remainingSeconds : undefined}
                      />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>
            </div>
          </>
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
  )
}
