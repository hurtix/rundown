"use client"

import React, { useState, useMemo } from "react"
import { Segment, Cue } from "@/modules/rundown/types"
import { useRundown } from "@/context/RundownContext"
import { createSegment, deleteSegment, updateSegment } from "@/server/segmentActions"
import { createCue, deleteCue, updateCue, reorderCues, listCuesByRundown } from "@/server/cueActions"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { GripVertical, Plus, Trash2, Edit2 } from "lucide-react"

interface SegmentTableProps {
  rundownId: string
}

export default function SegmentTable({ rundownId }: SegmentTableProps) {
  const { segments, cues, addSegment, deleteSegment: deleteSegmentLocal, addCue, deleteCue: deleteCueLocal, updateCue: updateCueLocal, setCues } = useRundown()
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const sortedCues = useMemo(() => [...cues].sort((a, b) => a.order - b.order), [cues])
  const sortedSegments = useMemo(() => [...segments].sort((a, b) => a.order - b.order), [segments])

  const handleAddSegment = async () => {
    try {
      const newOrder = (segments.length > 0 ? Math.max(...segments.map((s) => s.order)) : 0) + 1
      const newSegment = await createSegment({
        rundown_id: rundownId,
        order: newOrder,
        title: "New Segment",
      })
      addSegment(newSegment)
    } catch (error) {
      console.error("Error creating segment:", error)
    }
  }

  const handleEditSegmentStart = (segment: Segment) => {
    setEditingSegmentId(segment.id)
    setEditTitle(segment.title)
  }

  const handleSaveSegmentEdit = async (segmentId: string) => {
    await updateSegment(segmentId, { title: editTitle })
    setEditingSegmentId(null)
  }

  const handleDeleteSegment = async (segmentId: string) => {
    await deleteSegment(segmentId)
    deleteSegmentLocal(segmentId)
  }

  const handleAddCue = async () => {
    try {
      const newOrder = (cues.length > 0 ? Math.max(...cues.map((c) => c.order)) : 0) + 1
      const segmentId = segments.length > 0 ? segments[0].id : null
      const newCue = await createCue({
        rundown_id: rundownId,
        segment_id: segmentId,
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
    } catch (error) {
      console.error("Error creating cue:", error)
    }
  }

  const handleDeleteCue = async (cueId: string) => {
    await deleteCue(cueId)
    deleteCueLocal(cueId)
  }

  const handleUpdateCue = async (cueId: string, updates: Partial<Cue>) => {
    await updateCue(cueId, updates)
    updateCueLocal(cueId, updates)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    // Get ALL cues from database for accurate complete reordering
    const allCuesFromDB = await listCuesByRundown(rundownId)
    
    const draggedCue = allCuesFromDB.find((c) => c.id === active.id)
    if (!draggedCue) return

    // Check if dropping on a placeholder (empty segment)
    const placeholderMatch = (over.id as string)?.toString().match(/segment-placeholder-(.+)/)
    
    if (placeholderMatch) {
      // Dropping on empty segment - change segment_id
      const targetSegmentId = placeholderMatch[1]
      const targetSegment = segments.find((s) => s.id === targetSegmentId)
      
      if (targetSegment && draggedCue.segment_id !== targetSegmentId) {
        // Update cue to move to new segment
        const updatedCue: Cue = { ...draggedCue, segment_id: targetSegmentId }
        
        // Update all cues with new segment for dragged cue
        const allCuesAfterMove = allCuesFromDB.map((c) =>
          c.id === draggedCue.id ? updatedCue : c
        )

        // Update local state with sequential ordering
        allCuesAfterMove.forEach((cue, index) => {
          updateCueLocal(cue.id, { order: index + 1, segment_id: cue.segment_id })
        })

        // Sync to database
        const allCueIds = allCuesAfterMove.map((c) => c.id)
        await reorderCues(rundownId, allCueIds)
        await updateCue(draggedCue.id, { segment_id: targetSegmentId })

        // Refresh from database
        const refreshedCues = await listCuesByRundown(rundownId)
        setCues(refreshedCues)
      }
      return
    }

    // Dropping on a cue
    if (active.id === over.id) return

    const targetCue = allCuesFromDB.find((c) => c.id === over.id)
    if (!targetCue) return

    const currentOrder = allCuesFromDB.sort((a, b) => a.order - b.order)
    const draggedIndex = currentOrder.findIndex((c) => c.id === draggedCue.id)
    const targetIndex = currentOrder.findIndex((c) => c.id === targetCue.id)

    const newOrder = arrayMove(currentOrder, draggedIndex, targetIndex)
    const segmentChanged = draggedCue.segment_id !== targetCue.segment_id

    // Apply segment change if moving between segments
    const finalOrder = newOrder.map((cue) =>
      cue.id === draggedCue.id && segmentChanged
        ? { ...cue, segment_id: targetCue.segment_id }
        : cue
    )

    // Update local state with sequential ordering
    finalOrder.forEach((cue, index) => {
      updateCueLocal(cue.id, { order: index + 1, segment_id: cue.segment_id })
    })

    // Sync to database with all cues in order
    const allCueIds = finalOrder.map((c) => c.id)
    await reorderCues(rundownId, allCueIds)

    // If segment changed, ensure it's updated in database
    if (segmentChanged) {
      await updateCue(draggedCue.id, { segment_id: targetCue.segment_id })
    }

    // Refresh from database to ensure everything is in sync
    const refreshedCues = await listCuesByRundown(rundownId)
    setCues(refreshedCues)
  }

  const formatSeconds = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const getTotalDuration = () => {
    return cues.reduce((sum, cue) => sum + cue.duration_seconds, 0)
  }

  const getSegmentCues = (segmentId: string | null) => {
    return cues.filter((c) => c.segment_id === segmentId).sort((a, b) => a.order - b.order)
  }

  const totalDuration = getTotalDuration()

  return (
    <div className="space-y-6 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Rundown</h2>
          <p className="text-slate-400 mt-1">
            Total: <span className="font-semibold text-slate-300">{formatSeconds(totalDuration)}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAddSegment}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <Plus size={18} />
            Segment
          </button>
          <button
            onClick={handleAddCue}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <Plus size={18} />
            Cue
          </button>
        </div>
      </div>

      {/* Table */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto border border-slate-700 rounded-lg bg-slate-900/50 backdrop-blur scrollbar-subtle">
          <table className="w-full text-sm text-slate-200">
            <thead className="bg-slate-800 border-b border-slate-700 sticky top-0">
              <tr>
                <th className="px-3 py-3 text-left text-slate-400 w-8">
                  <GripVertical size={16} className="text-slate-600" />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300 w-12">#</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300 w-16">Color</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300 w-24">Duration</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300 w-24">Camera</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300 w-24">Audio</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300 w-24">Graphics</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-300 flex-1">Notes</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-300 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              <SortableContext 
                items={[
                  ...sortedCues.map((c) => c.id),
                  ...sortedSegments.filter(seg => getSegmentCues(seg.id).length === 0).map(seg => `segment-placeholder-${seg.id}`)
                ]} 
                strategy={verticalListSortingStrategy}
              >
                {sortedSegments.map((segment) => {
                  const segmentCues = getSegmentCues(segment.id)
                  const segmentDuration = segmentCues.reduce((sum, c) => sum + c.duration_seconds, 0)

                  return (
                    <React.Fragment key={segment.id}>
                      {/* Segment Header - always show, even if empty */}
                      <tr className="bg-blue-950/30 border-t-2 border-blue-700/50 hover:bg-blue-950/50 transition-colors">
                        <td colSpan={10} className="px-4 py-4">
                          {editingSegmentId === segment.id ? (
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveSegmentEdit(segment.id)}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingSegmentId(null)}
                                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-bold text-base text-blue-300">{segment.title}</h3>
                                <p className="text-xs text-slate-400 mt-1">
                                  {segmentCues.length} cue{segmentCues.length !== 1 ? "s" : ""} • {formatSeconds(segmentDuration)}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditSegmentStart(segment)}
                                  className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded transition-colors"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSegment(segment.id)}
                                  className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Cues in this segment */}
                      {segmentCues.length > 0 ? (
                        segmentCues.map((cue) => {
                          const globalIndex = sortedCues.findIndex((c) => c.id === cue.id)
                          return (
                            <SortableCueRow
                              key={`cue-${cue.id}`}
                              cue={cue}
                              index={globalIndex}
                              onUpdate={handleUpdateCue}
                              onDelete={handleDeleteCue}
                            />
                          )
                        })
                      ) : (
                        <EmptySegmentPlaceholder segmentId={segment.id} />
                      )}
                    </React.Fragment>
                  )
                })}

                {/* Unassigned Cues */}
                {getSegmentCues(null).length > 0 && (
                  <React.Fragment>
                    <tr className="bg-slate-800/30 border-t-2 border-slate-600/50">
                      <td colSpan={10} className="px-4 py-3">
                        <h3 className="font-bold text-sm text-slate-400">Unassigned</h3>
                      </td>
                    </tr>
                    {getSegmentCues(null).map((cue) => {
                      const globalIndex = sortedCues.findIndex((c) => c.id === cue.id)
                      return (
                        <SortableCueRow
                          key={`cue-${cue.id}`}
                          cue={cue}
                          index={globalIndex}
                          onUpdate={handleUpdateCue}
                          onDelete={handleDeleteCue}
                        />
                      )
                    })}
                  </React.Fragment>
                )}
              </SortableContext>
            </tbody>
          </table>
        </div>
      </DndContext>

      {sortedCues.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg">No cues yet. Create a segment and add cues.</p>
        </div>
      )}
    </div>
  )
}

// Empty Segment Placeholder Component for sortable drop target
interface EmptySegmentPlaceholderProps {
  segmentId: string
}

function EmptySegmentPlaceholder({ segmentId }: EmptySegmentPlaceholderProps) {
  const placeholderId = `segment-placeholder-${segmentId}`
  const { setNodeRef, isOver } = useSortable({ id: placeholderId })

  return (
    <tr 
      ref={setNodeRef}
      className={`h-16 border-b border-slate-700/30 transition-colors ${
        isOver ? "bg-blue-600/30 border-blue-500/50" : "hover:bg-slate-700/20"
      }`}
    >
      <td colSpan={10} className="px-4 py-8 text-center text-slate-500 text-sm italic">
        {isOver ? "Drop here" : "Drag cues here"}
      </td>
    </tr>
  )
}

// Sortable Cue Row Component
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SortableCueRowProps {
  cue: Cue
  index: number
  onUpdate: (cueId: string, updates: Partial<Cue>) => void
  onDelete: (cueId: string) => void
}

function SortableCueRow({ cue, index, onUpdate, onDelete }: SortableCueRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(cue)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cue.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSave = () => {
    onUpdate(cue.id, editData)
    setIsEditing(false)
  }

  const handleChange = (field: keyof Cue, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const parseDuration = (timeStr: string) => {
    const parts = timeStr.split(":").map(Number)
    if (parts.length !== 3) return 0
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }

  const colorMap = {
    red: "🔴",
    blue: "🔵",
    green: "🟢",
    yellow: "🟡",
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b transition-colors ${
        isDragging ? "bg-blue-600/20 shadow-lg" : "hover:bg-slate-800/30"
      } ${isEditing ? "bg-slate-800/50" : ""}`}
    >
      <td className="px-3 py-3 text-slate-600 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        <GripVertical size={18} className="text-slate-500" />
      </td>
      <td className="px-4 py-3 text-slate-400 font-medium w-12">{index + 1}</td>
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="text"
            value={editData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <span className="text-slate-200">{cue.title}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <select
            value={editData.color || "blue"}
            onChange={(e) => handleChange("color", e.target.value)}
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="red">🔴 Red</option>
            <option value="blue">🔵 Blue</option>
            <option value="green">🟢 Green</option>
            <option value="yellow">🟡 Yellow</option>
          </select>
        ) : (
          <span className="text-lg">{colorMap[cue.color as keyof typeof colorMap] || "🔵"}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="text"
            value={formatDuration(editData.duration_seconds)}
            onChange={(e) => handleChange("duration_seconds", parseDuration(e.target.value))}
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="HH:MM:SS"
          />
        ) : (
          <span className="text-slate-400 font-mono">{formatDuration(cue.duration_seconds)}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="text"
            value={editData.camera || ""}
            onChange={(e) => handleChange("camera", e.target.value || null)}
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <span className="text-slate-500 text-xs">{cue.camera || "—"}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="text"
            value={editData.audio || ""}
            onChange={(e) => handleChange("audio", e.target.value || null)}
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <span className="text-slate-500 text-xs">{cue.audio || "—"}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="text"
            value={editData.graphics || ""}
            onChange={(e) => handleChange("graphics", e.target.value || null)}
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <span className="text-slate-500 text-xs">{cue.graphics || "—"}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            type="text"
            value={editData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value || null)}
            className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add notes..."
          />
        ) : (
          <span className="text-slate-500 text-xs line-clamp-2">{cue.notes || "—"}</span>
        )}
      </td>
      <td className="px-4 py-3 text-center space-x-2 flex justify-center gap-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded transition-colors font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors font-medium"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(cue.id)}
              className="p-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </td>
    </tr>
  )
}


