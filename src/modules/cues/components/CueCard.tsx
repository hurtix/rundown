"use client"

import React, { useState } from "react"
import { Cue } from "@/modules/rundown/types"
import { updateCue } from "@/server/cueActions"
import { CogIcon, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface CueCardProps {
  cue: Cue
  isDragging: boolean
  isDragOver: boolean
  onDragStart: () => void
  onDragOver: () => void
  onDragLeave: () => void
  onDragEnd: () => void
  onDrop: () => void
  onDelete: () => void
  onUpdate?: (cueId: string, updates: Partial<Cue>) => void
}

export default function CueCard({
  cue,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDragEnd,
  onDrop,
  onDelete,
  onUpdate,
}: CueCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(cue.title)

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

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const getColorDot = (color: string | null) => {
    const colors: Record<string, string> = {
      default: "bg-gray-900",
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
    }
    return colors[color || "default"] || "bg-gray-400"
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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", cue.id)
    onDragStart()
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        onDragOver()
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onDrop()
      }}
      onDragEnd={onDragEnd}
      className={`relative group bg-transparent flex gap-1 p-0.5 items-stretch min-h-[84px] w-full min-w-full transition-all duration-200 ${
        isDragOver
          ? "border-blue-500 shadow-lg"
          : isDragging
            ? "border-slate-600 opacity-50"
            : "border-slate-700 hover:opacity-90"
      } cursor-grab active:cursor-grabbing`}
    >
      {/* Drag Handle */}
      <div className="w-7 flex-none flex items-center justify-center opacity-0 group-hover:opacity-70 transition-opacity">
        <div className="flex flex-col gap-1">
          <div className="w-0.5 h-0.5 bg-white rounded"></div>
          <div className="w-0.5 h-0.5 bg-white rounded"></div>
          <div className="w-0.5 h-0.5 bg-white rounded"></div>
        </div>
      </div>

      {/* Cue Number Column */}
      <section className={`w-12 flex-none flex items-center justify-center ${getCardBackgroundClass(cue.color)} text-white font-mono text-sm rounded`}>
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

      {/* Duration Column */}
      <section className={`w-24 flex-none flex items-center justify-center ${getCardBackgroundClass(cue.color)} rounded`}>
        <span className="font-mono text-sm text-white font-bold">
          {formatDuration(cue.duration_seconds)}
        </span>
      </section>

      {/* Color Column */}
      <section className={`w-16 flex-none flex items-center justify-center gap-2 ${getCardBackgroundClass(cue.color)} rounded`}>
        <span
          className="w-6 h-6 rounded"
          style={{ backgroundColor: cue.color ? getColorDot(cue.color).split("-")[1] : "#666" }}
          title="Color indicator"
        />
      </section>

      {/* Camera Column */}
      <section className={`w-64 flex-none flex items-center px-3 ${getCardBackgroundClass(cue.color)} rounded`}>
        <span title="Camera">{cue.camera}</span>
      </section>

      {/* Audio Column */}
      <section className={`w-64 flex-none flex items-center px-3 ${getCardBackgroundClass(cue.color)} rounded`}>
        <span title="Audio">{cue.audio}</span>
      </section>

      {/* Graphics Column */}
      <section className={`w-64 flex-none flex items-center px-3 ${getCardBackgroundClass(cue.color)} rounded`}>
        <span title="Graphics">{cue.graphics}</span>
      </section>

      {/* Actions Column */}
      <section className={`w-16 flex-none flex items-center justify-center ${getCardBackgroundClass(cue.color)} rounded opacity-0 group-hover:opacity-100 transition-opacity`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-black/20 rounded transition-colors">
            <CogIcon className="w-4 h-4 text-white" />
              <MoreVertical className="w-4 h-4 text-white" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-700">
            <DropdownMenuItem
              onClick={() => setIsEditingTitle(true)}
              className="text-white hover:bg-slate-800 cursor-pointer"
            >
              ✏️ Edit Title
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-700" />

            <DropdownMenuItem className="text-white p-0">
              <div className="w-full p-1.5">
                <div className="text-xs text-slate-400 mb-2">🎨 Change Color</div>
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

            <DropdownMenuSeparator className="bg-slate-700" />

            <DropdownMenuItem
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-400 hover:bg-red-950 cursor-pointer"
            >
              🗑️ Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-auto">
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
  )
}
