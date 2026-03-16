"use client"

import React, { useState, useRef, useEffect } from "react"
import { Rundown } from "@/modules/rundown/types"
import { updateRundown, deleteRundown } from "@/server/rundownActions"
import Link from "next/link"

interface RundownHeaderProps {
  rundown: Rundown
  onUpdate?: (rundown: Rundown) => void
  onDelete?: () => void
}

export default function RundownHeader({
  rundown,
  onUpdate,
  onDelete,
}: RundownHeaderProps) {
  const [displayRundown, setDisplayRundown] = useState(rundown)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(rundown)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const timePickerRef = useRef<HTMLDivElement>(null)
  const [pickerHours, setPickerHours] = useState('12')
  const [pickerMinutes, setPickerMinutes] = useState('00')
  const [pickerSeconds, setPickerSeconds] = useState('00')
  const [pickerAmPm, setPickerAmPm] = useState<'AM' | 'PM'>('AM')

  // Sync local display state with prop changes
  useEffect(() => {
    setDisplayRundown(rundown)
  }, [rundown])

  const handleOpenTimePicker = () => {
    if (editData.event_date) {
      const date = new Date(editData.event_date)
      // Convert from UTC to GMT-5 (subtract 5 hours)
      let hours = date.getUTCHours() - 5
      // Handle day wrap around
      if (hours < 0) hours += 24
      
      const ampm = hours >= 12 ? 'PM' : 'AM'
      let displayHours = hours
      if (displayHours > 12) displayHours -= 12
      if (displayHours === 0) displayHours = 12
      
      setPickerHours(displayHours.toString().padStart(2, '0'))
      setPickerMinutes(date.getUTCMinutes().toString().padStart(2, '0'))
      setPickerSeconds(date.getUTCSeconds().toString().padStart(2, '0'))
      setPickerAmPm(ampm)
    }
    setShowTimePicker(true)
  }

  const handleSaveTime = () => {
    const date = new Date(editData.event_date || new Date())
    let hours = parseInt(pickerHours)
    if (pickerAmPm === 'PM' && hours !== 12) hours += 12
    if (pickerAmPm === 'AM' && hours === 12) hours = 0
    
    // Convert from GMT-5 to UTC (add 5 hours)
    hours = hours + 5
    if (hours >= 24) hours -= 24
    
    date.setUTCHours(hours, parseInt(pickerMinutes), parseInt(pickerSeconds), 0)
    setEditData((prev) => ({
      ...prev,
      event_date: date.toISOString(),
    }))
    setShowTimePicker(false)
  }

  const handleCancelTime = () => {
    setShowTimePicker(false)
  }

  const handleSave = async () => {
    const updated = await updateRundown(displayRundown.id, {
      title: editData.title,
      description: editData.description,
      event_date: editData.event_date,
    })
    setDisplayRundown(updated)
    setEditData(updated)
    onUpdate?.(updated)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm("Are you sure? This will delete all associated cues.")) {
      await deleteRundown(displayRundown.id)
      onDelete?.()
    }
  }

  return (
    <div className="bg-gray-950 border border-white/30 p-6 rounded-lg">
      <div className="w-full mx-auto space-y-4">
        {isEditing ? (
          <>
            <input
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="text-3xl font-bold w-full px-3 py-2 border border-white/30 rounded bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <textarea
              value={editData.description || ""}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  description: e.target.value || null,
                }))
              }
              className="w-full px-3 py-2 border border-white/30 rounded bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add description..."
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-400">Start Time</label>
              <div className="relative">
                <button
                  onClick={handleOpenTimePicker}
                  className="w-full px-3 py-2 border border-white/30 rounded bg-gray-950 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left hover:bg-gray-900 transition-colors"
                >
                  {editData.event_date
                    ? (() => {
                        const date = new Date(editData.event_date)
                        // Convert UTC to GMT-5 manually
                        let hours = date.getUTCHours() - 5
                        if (hours < 0) hours += 24
                        let minutes = date.getUTCMinutes()
                        let seconds = date.getUTCSeconds()
                        let ampm = hours >= 12 ? 'PM' : 'AM'
                        let displayHours = hours
                        if (displayHours > 12) displayHours -= 12
                        if (displayHours === 0) displayHours = 12
                        return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`
                      })()
                    : "Select time"}
                </button>
                {showTimePicker && (
                  <div
                    ref={timePickerRef}
                    className="absolute top-full mt-2 left-0 bg-gray-950 border border-white/30 rounded-lg p-4 z-50 shadow-lg min-w-[280px]"
                  >
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-400 text-center">Hours</label>
                          <select
                            value={pickerHours}
                            onChange={(e) => setPickerHours(e.target.value)}
                            className="px-2 py-1 border border-white/30 rounded bg-gray-950 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {Array.from({ length: 12 }, (_, i) => {
                              const hour = i + 1
                              return (
                                <option key={hour} value={hour.toString().padStart(2, '0')}>
                                  {hour.toString().padStart(2, '0')}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-400 text-center">Minutes</label>
                          <select
                            value={pickerMinutes}
                            onChange={(e) => setPickerMinutes(e.target.value)}
                            className="px-2 py-1 border border-white/30 rounded bg-gray-950 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option key={i} value={i.toString().padStart(2, '0')}>
                                {i.toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-400 text-center">Seconds</label>
                          <select
                            value={pickerSeconds}
                            onChange={(e) => setPickerSeconds(e.target.value)}
                            className="px-2 py-1 border border-white/30 rounded bg-gray-950 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option key={i} value={i.toString().padStart(2, '0')}>
                                {i.toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-slate-400 text-center">AM/PM</label>
                          <select
                            value={pickerAmPm}
                            onChange={(e) => setPickerAmPm(e.target.value as 'AM' | 'PM')}
                            className="px-2 py-1 border border-white/30 rounded bg-gray-950 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleSaveTime}
                          className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-medium transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelTime}
                          className="flex-1 px-3 py-2 bg-gray-950 hover:bg-gray-900 text-white rounded text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-950 hover:bg-gray-900 text-white rounded font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white">{displayRundown.title}</h1>
            {displayRundown.description && (
              <p className="text-slate-400">{displayRundown.description}</p>
            )}
            {displayRundown.event_date && (
              <p className="text-sm text-slate-400">
                <span className="text-gray-400">Start Time: </span>
                <span className="font-mono font-semibold text-white">
                  {(() => {
                    const date = new Date(displayRundown.event_date)
                    // Convert UTC to GMT-5 manually
                    let hours = date.getUTCHours() - 5
                    if (hours < 0) hours += 24
                    let minutes = date.getUTCMinutes()
                    let seconds = date.getUTCSeconds()
                    let ampm = hours >= 12 ? 'PM' : 'AM'
                    let displayHours = hours
                    if (displayHours > 12) displayHours -= 12
                    if (displayHours === 0) displayHours = 12
                    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`
                  })()}
                </span>
              </p>
            )}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
              >
                Edit
              </button>
              <Link
                href={`/rundowns/${displayRundown.id}/live`}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors"
              >
                Go Live
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
