"use client"

import React, { useState } from "react"
import { Cue } from "@/modules/rundown/types"

interface CueRowProps {
  cue: Cue
  index: number
  onUpdate: (cueId: string, updates: Partial<Cue>) => void
  onDelete: (cueId: string) => void
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
}

export default function CueRow({
  cue,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}: CueRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(cue)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", cue.id)
    setIsDragging(true)
    onDragStart()
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    onDragOver(e)
  }

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    onDrop()
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

  // Parse duration to HH:MM:SS for display
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

  return (
    <tr
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`border-b transition-colors ${
        isDragging ? "bg-blue-100 opacity-50" : "hover:bg-blue-50"
      } cursor-grab active:cursor-grabbing`}
    >
      <td className="px-2 py-2 text-center text-gray-400 text-lg select-none">☰</td>
      <td className="px-4 py-2 text-gray-700 font-medium">{index + 1}</td>
      <td className="px-4 py-2">
        {isEditing ? (
          <input
            type="text"
            value={editData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
            autoFocus
          />
        ) : (
          <span className="text-gray-900">{cue.title}</span>
        )}
      </td>
      <td className="px-4 py-2">
        {isEditing ? (
          <select
            value={editData.color || "blue"}
            onChange={(e) => handleChange("color", e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
          >
            <option value="red">🔴 Red</option>
            <option value="blue">🔵 Blue</option>
            <option value="green">🟢 Green</option>
            <option value="yellow">🟡 Yellow</option>
          </select>
        ) : (
          <span className="text-sm">
            {cue.color === "red" && "🔴"}
            {cue.color === "blue" && "🔵"}
            {cue.color === "green" && "🟢"}
            {cue.color === "yellow" && "🟡"}
          </span>
        )}
      </td>
      <td className="px-4 py-2">
        {isEditing ? (
          <input
            type="text"
            value={formatDuration(editData.duration_seconds)}
            onChange={(e) => handleChange("duration_seconds", parseDuration(e.target.value))}
            className="w-full px-2 py-1 border rounded text-sm"
            placeholder="HH:MM:SS"
          />
        ) : (
          <span className="text-gray-600 font-mono">{formatDuration(cue.duration_seconds)}</span>
        )}
      </td>
      <td className="px-4 py-2">
        {isEditing ? (
          <input
            type="text"
            value={editData.camera || ""}
            onChange={(e) => handleChange("camera", e.target.value || null)}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        ) : (
          <span className="text-gray-600 text-xs">{cue.camera || "—"}</span>
        )}
      </td>
      <td className="px-4 py-2">
        {isEditing ? (
          <input
            type="text"
            value={editData.audio || ""}
            onChange={(e) => handleChange("audio", e.target.value || null)}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        ) : (
          <span className="text-gray-600 text-xs">{cue.audio || "—"}</span>
        )}
      </td>
      <td className="px-4 py-2">
        {isEditing ? (
          <input
            type="text"
            value={editData.graphics || ""}
            onChange={(e) => handleChange("graphics", e.target.value || null)}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        ) : (
          <span className="text-gray-600 text-xs">{cue.graphics || "—"}</span>
        )}
      </td>
      <td className="px-4 py-2">
        {isEditing ? (
          <input
            type="text"
            value={editData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value || null)}
            className="w-full px-2 py-1 border rounded text-sm"
            placeholder="Add notes..."
          />
        ) : (
          <span className="text-gray-600 text-xs line-clamp-2">{cue.notes || "—"}</span>
        )}
      </td>
      <td className="px-4 py-2 text-center space-x-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(cue.id)}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  )
}
