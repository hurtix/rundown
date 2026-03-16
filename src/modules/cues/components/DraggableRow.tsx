"use client"

import React, { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Cue } from "@/modules/rundown/types"
import { updateCue } from "@/server/cueActions"
import { MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { DragHandle } from "./DragHandle"
import { EditableProductionField } from "./EditableProductionField"

interface DraggableRowProps {
  cue: Cue
  rundownStartTime?: string | null
  allCues: Cue[]
  onDelete: () => void
  onUpdate?: (cueId: string, updates: Partial<Cue>) => void
  isCurrentCue?: boolean
  isNextCue?: boolean
  isPassed?: boolean
  countdownSeconds?: number
}

export function DraggableRow({ cue, rundownStartTime, allCues, onDelete, onUpdate, isCurrentCue, isNextCue, isPassed, countdownSeconds }: DraggableRowProps) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: cue.id,
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(cue.title)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [editedNotes, setEditedNotes] = useState(cue.notes || "")
  const [showDurationPicker, setShowDurationPicker] = useState(false)
  const [durationHours, setDurationHours] = useState("0")
  const [durationMinutes, setDurationMinutes] = useState("0")
  const [durationSeconds, setDurationSeconds] = useState("0")
  const durationPickerRef = useRef<HTMLDivElement>(null)

  // Close duration picker when clicking outside
  useEffect(() => {
    if (!showDurationPicker) return

    const handleClickOutside = (event: MouseEvent) => {
      if (durationPickerRef.current && !durationPickerRef.current.contains(event.target as Node)) {
        setShowDurationPicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showDurationPicker])

  const handleSaveTitle = async () => {
    if (editedTitle.trim() === "") {
      setEditedTitle(cue.title)
      setIsEditingTitle(false)
      return
    }

    if (editedTitle === cue.title) {
      setIsEditingTitle(false)
      return
    }

    try {
      await updateCue(cue.id, { title: editedTitle })
      onUpdate?.(cue.id, { title: editedTitle })
      setIsEditingTitle(false)
    } catch (error) {
      console.error("Error updating title:", error)
      setEditedTitle(cue.title)
      setIsEditingTitle(false)
    }
  }

  const handleColorChange = async (newColor: "red" | "blue" | "green" | "yellow" | null) => {
    try {
      await updateCue(cue.id, { color: newColor })
      onUpdate?.(cue.id, { color: newColor })
    } catch (error) {
      console.error("Error updating color:", error)
    }
  }

  const handleOpenDurationPicker = () => {
    const h = Math.floor(cue.duration_seconds / 3600)
    const m = Math.floor((cue.duration_seconds % 3600) / 60)
    const s = cue.duration_seconds % 60
    setDurationHours(h.toString().padStart(2, "0"))
    setDurationMinutes(m.toString().padStart(2, "0"))
    setDurationSeconds(s.toString().padStart(2, "0"))
    setShowDurationPicker(true)
  }

  const handleSaveDuration = async () => {
    const totalSeconds = parseInt(durationHours) * 3600 + parseInt(durationMinutes) * 60 + parseInt(durationSeconds)
    try {
      await updateCue(cue.id, { duration_seconds: totalSeconds })
      onUpdate?.(cue.id, { duration_seconds: totalSeconds })
      setShowDurationPicker(false)
    } catch (error) {
      console.error("Error updating duration:", error)
    }
  }

  const handleCancelDuration = () => {
    setShowDurationPicker(false)
  }

  const handleSaveNotes = async () => {
    if (editedNotes === cue.notes) {
      setIsEditingNotes(false)
      return
    }

    try {
      await updateCue(cue.id, { notes: editedNotes || null })
      onUpdate?.(cue.id, { notes: editedNotes || null })
      setIsEditingNotes(false)
    } catch (error) {
      console.error("Error updating notes:", error)
      setEditedNotes(cue.notes || "")
      setIsEditingNotes(false)
    }
  }

  const handleSaveProductionField = async (field: "camera" | "multimedia" | "audio" | "graphics", value: string | null) => {
    try {
      await updateCue(cue.id, { [field]: value })
      onUpdate?.(cue.id, { [field]: value })
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
    }
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    const parts = []
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    if (s > 0 || parts.length === 0) parts.push(`${s}s`)
    
    return parts.join(" ")
  }

  const calculateStartTime = () => {
    if (!rundownStartTime) return "—"
    
    // Find the index of current cue
    const currentIndex = allCues.findIndex(c => c.id === cue.id)
    if (currentIndex === -1) return "—"
    
    // Sum duration of all cues before this one
    let accumulatedSeconds = 0
    for (let i = 0; i < currentIndex; i++) {
      accumulatedSeconds += allCues[i].duration_seconds || 0
    }
    
    // Add accumulated seconds to start time
    const startDate = new Date(rundownStartTime)
    startDate.setUTCSeconds(startDate.getUTCSeconds() + accumulatedSeconds)
    
    // Convert from UTC to GMT-5 manually
    let hours = startDate.getUTCHours() - 5
    if (hours < 0) hours += 24
    let minutes = startDate.getUTCMinutes()
    let seconds = startDate.getUTCSeconds()
    let ampm = hours >= 12 ? 'PM' : 'AM'
    let displayHours = hours
    if (displayHours > 12) displayHours -= 12
    if (displayHours === 0) displayHours = 12
    
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`
  }

  const getCardBackgroundClass = (color: string | null) => {
    const colors: Record<string, string> = {
      red: "bg-red-900",
      blue: "bg-blue-900",
      green: "bg-green-900",
      yellow: "bg-yellow-900",
    }
    return color && color in colors ? colors[color] : "bg-gray-900"
  }

  const getAvailableOptions = (fieldName: "camera" | "multimedia" | "audio" | "graphics"): string[] => {
    const optionsSet = new Set<string>()
    
    // Collect all non-empty values from all cues for this field
    allCues.forEach((c) => {
      const fieldValue = c[fieldName]
      if (fieldValue) {
        // Split by comma and add each item (in case multiple items are stored together)
        fieldValue.split(",").forEach((item) => {
          const trimmed = item.trim()
          if (trimmed) {
            optionsSet.add(trimmed)
          }
        })
      }
    })
    
    return Array.from(optionsSet).sort()
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
  }

  return (
    <div className="relative w-full">
      {/* Current Cue Indicator */}
      {isCurrentCue && (
        <div className="relative">
          <span className="mt-4 w-full h-1 block bg-[#ef4444] outline-4 outline-black"></span>
          <span className="absolute -top-[6px] ml-8 text-xs font-bold uppercase text-[#ef4444] bg-black px-2">
            Current cue
          </span>
        </div>
      )}

      {/* Next Cue Indicator */}
      {isNextCue && (
        <div className="relative">
          <span className="mt-1 mb-4 w-full h-[2px] block bg-gray-400 outline-4 outline-black"></span>
          <span className="absolute -top-[6px] ml-8 text-xs font-bold uppercase text-gray-300 bg-black px-2">
            Next cue
          </span>
        </div>
      )}

    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "relative" : "static"} bg-transparent flex gap-1 p-2 items-stretch min-h-[84px] w-full min-w-full transition-all duration-200 rounded ${
        isDragging ? "opacity-50 border-slate-600 z-10" : "border-slate-700"
      } ${isPassed ? "opacity-30" : ""}`}
    >
      {/* Drag Handle */}
      <DragHandle id={cue.id} />

      {/* Cue Number Column */}
      <section className={`w-12 flex-none flex items-center justify-center ${isCurrentCue ? "bg-red-600 animate-pulse" : getCardBackgroundClass(cue.color)} text-white font-mono text-sm rounded font-bold`}>
        {cue.order || 1}
      </section>

      {/* Title Column */}
      <section className={`flex-1 flex items-center px-4 ${getCardBackgroundClass(cue.color)} w-[500px] rounded`}>
        {isEditingTitle ? (
          <input
            autoFocus
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveTitle()
              } else if (e.key === "Escape") {
                setEditedTitle(cue.title)
                setIsEditingTitle(false)
              }
            }}
            className={`w-full ${getCardBackgroundClass(cue.color)} text-white px-2 py-1 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`}
          />
        ) : (
          <div
            className="flex items-center gap-2 min-w-0 flex-1 cursor-text hover:opacity-80 transition-opacity"
            onClick={() => setIsEditingTitle(true)}
          >
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {cue.title}
              </h3>
              <p className="text-xs text-gray-400 truncate">
                Cue #{cue.order || 1}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Start Time Column */}
      <section className={`w-32 flex-none flex items-center justify-center ${getCardBackgroundClass(cue.color)} rounded`}>
        <span className="font-mono text-sm text-white font-bold">
          {calculateStartTime()}
        </span>
      </section>

      {/* Duration Column */}
      <section className={`w-24 flex-none flex items-center justify-center relative ${getCardBackgroundClass(cue.color)} rounded`}>
        <div ref={durationPickerRef} className="w-full h-full flex items-center justify-center">
          <button
            onClick={handleOpenDurationPicker}
            className="font-mono text-sm text-white font-bold hover:opacity-80 transition-opacity cursor-pointer"
          >
            {countdownSeconds !== undefined ? formatDuration(countdownSeconds) : formatDuration(cue.duration_seconds)}
          </button>
          {showDurationPicker && (
            <div
              className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-slate-800 border border-slate-600 rounded-lg p-4 z-[9999] shadow-lg min-w-[240px]"
            >
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 text-center">Hours</label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    className="px-2 py-1 border border-slate-600 rounded bg-slate-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, "0")}>
                        {i.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 text-center">Minutes</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="px-2 py-1 border border-slate-600 rounded bg-slate-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, "0")}>
                        {i.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 text-center">Seconds</label>
                  <select
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(e.target.value)}
                    className="px-2 py-1 border border-slate-600 rounded bg-slate-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i.toString().padStart(2, "0")}>
                        {i.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveDuration}
                  className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelDuration}
                  className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            </div>
          )}
        </div>
      </section>

      {/* Camera Column */}
      <section className={`w-48 flex-none flex items-center px-2 ${getCardBackgroundClass(cue.color)} rounded`}>
        <EditableProductionField
          value={cue.camera}
          onSave={(value) => handleSaveProductionField("camera", value)}
          placeholder="Add camera..."
          availableOptions={getAvailableOptions("camera")}
        />
      </section>

      {/* Multimedia Column */}
      <section className={`w-48 flex-none flex items-center px-2 ${getCardBackgroundClass(cue.color)} rounded`}>
        <EditableProductionField
          value={cue.multimedia}
          onSave={(value) => handleSaveProductionField("multimedia", value)}
          placeholder="Add multimedia..."
          availableOptions={getAvailableOptions("multimedia")}
        />
      </section>

      {/* Audio Column */}
      <section className={`w-48 flex-none flex items-center px-2 ${getCardBackgroundClass(cue.color)} rounded`}>
        <EditableProductionField
          value={cue.audio}
          onSave={(value) => handleSaveProductionField("audio", value)}
          placeholder="Add audio..."
          availableOptions={getAvailableOptions("audio")}
        />
      </section>

      {/* Graphics Column */}
      <section className={`w-48 flex-none flex items-center px-2 ${getCardBackgroundClass(cue.color)} rounded`}>
        <EditableProductionField
          value={cue.graphics}
          onSave={(value) => handleSaveProductionField("graphics", value)}
          placeholder="Add graphics..."
          availableOptions={getAvailableOptions("graphics")}
        />
      </section>

      {/* Notes Column */}
      <section className={`w-64 flex-none flex items-center px-2 ${getCardBackgroundClass(cue.color)} rounded`}>
        {isEditingNotes ? (
          <input
            autoFocus
            type="text"
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            onBlur={handleSaveNotes}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveNotes()
              } else if (e.key === "Escape") {
                setEditedNotes(cue.notes || "")
                setIsEditingNotes(false)
              }
            }}
            placeholder="Add notes..."
            className={`w-full ${getCardBackgroundClass(cue.color)} text-white px-2 py-1 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm`}
          />
        ) : (
          <div
            className="flex items-center gap-2 min-w-0 flex-1 cursor-text hover:opacity-80 transition-opacity"
            onClick={() => setIsEditingNotes(true)}
          >
            <div className="flex-1 min-w-0">
              {cue.notes ? (
                <p className="text-sm text-white">
                  {cue.notes}
                </p>
              ) : (
                <p className="text-xs text-slate-400">Add notes...</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Actions Column */}
      <section className={`w-8 flex-none flex items-center justify-center ${getCardBackgroundClass(cue.color)} rounded transition-opacity`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-black/20 rounded transition-colors">
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-gray-950 border-slate-700">
            <DropdownMenuItem
              onClick={() => setIsEditingTitle(true)}
              className="text-white hover:bg-slate-800 cursor-pointer"
            >
              Edit Title
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/30" />

            <DropdownMenuItem className="text-white p-0">
              <div className="w-full p-1.5">
                <div className="text-xs text-slate-400 mb-2">Change Color</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleColorChange(null)}
                    className={`w-5 h-5 rounded border-2 transition-all ${!cue.color ? "border-white" : "border-slate-600"}`}
                    style={{ backgroundColor: "#666" }}
                  />
                  <button
                    onClick={() => handleColorChange("red")}
                    className={`w-5 h-5 rounded border-2 transition-all ${cue.color === "red" ? "border-white" : "border-slate-600"}`}
                    style={{ backgroundColor: "#ef4444" }}
                  />
                  <button
                    onClick={() => handleColorChange("blue")}
                    className={`w-5 h-5 rounded border-2 transition-all ${cue.color === "blue" ? "border-white" : "border-slate-600"}`}
                    style={{ backgroundColor: "#3b82f6" }}
                  />
                  <button
                    onClick={() => handleColorChange("green")}
                    className={`w-5 h-5 rounded border-2 transition-all ${cue.color === "green" ? "border-white" : "border-slate-600"}`}
                    style={{ backgroundColor: "#22c55e" }}
                  />
                  <button
                    onClick={() => handleColorChange("yellow")}
                    className={`w-5 h-5 rounded border-2 transition-all ${cue.color === "yellow" ? "border-white" : "border-slate-600"}`}
                    style={{ backgroundColor: "#eab308" }}
                  />
                </div>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/30" />

            <DropdownMenuItem
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white hover:bg-red-800 cursor-pointer rounded"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-4 shadow-lg border border-gray-700">
            <p className="text-sm font-semibold text-white mb-3">Delete "{cue.title}"?</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onDelete()
                  setShowDeleteConfirm(false)
                }}
                className="flex-1 px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
