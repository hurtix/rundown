"use client"

import Link from "next/link"
import { Rundown } from "@/modules/rundown/types"
import { deleteRundown, updateRundown } from "@/server/rundownActions"
import { useState, useRef } from "react"

interface RundownListProps {
  rundowns: Rundown[]
}

export default function RundownList({ rundowns: initialRundowns }: RundownListProps) {
  const [rundowns, setRundowns] = useState(initialRundowns)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Rundown>>({})
  const [showTimePicker, setShowTimePicker] = useState(false)
  const timePickerRef = useRef<HTMLDivElement>(null)
  const [pickerHours, setPickerHours] = useState('12')
  const [pickerMinutes, setPickerMinutes] = useState('00')
  const [pickerSeconds, setPickerSeconds] = useState('00')
  const [pickerAmPm, setPickerAmPm] = useState<'AM' | 'PM'>('AM')

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This will also delete all associated cues.`)) {
      setDeleting(id)
      try {
        await deleteRundown(id)
        setRundowns(rundowns.filter(r => r.id !== id))
      } catch (error) {
        console.error("Failed to delete rundown:", error)
        alert("Failed to delete rundown")
      } finally {
        setDeleting(null)
      }
    }
  }

  const handleEdit = (rundown: Rundown) => {
    setEditingId(rundown.id)
    setEditData({
      title: rundown.title,
      description: rundown.description,
      event_date: rundown.event_date,
    })
  }

  const handleOpenTimePicker = () => {
    if (editData.event_date) {
      const date = new Date(editData.event_date)
      let hours = date.getUTCHours() - 5
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
    
    hours = hours + 5
    if (hours >= 24) hours -= 24
    
    date.setUTCHours(hours, parseInt(pickerMinutes), parseInt(pickerSeconds), 0)
    setEditData((prev) => ({
      ...prev,
      event_date: date.toISOString(),
    }))
    setShowTimePicker(false)
  }

  const handleSave = async () => {
    if (editingId) {
      try {
        const updated = await updateRundown(editingId, {
          title: editData.title || '',
          description: editData.description,
          event_date: editData.event_date,
        })
        setRundowns(rundowns.map(r => r.id === editingId ? updated : r))
        setEditingId(null)
      } catch (error) {
        console.error("Failed to save rundown:", error)
        alert("Failed to save rundown")
      }
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setShowTimePicker(false)
  }
  return (
    <div className="space-y-4 min-h-screen bg-gray-900">
      <div className="flex justify-between items-center p-8 border-b border-gray-800">
        <h2 className="text-3xl font-bold text-white">Rundowns</h2>
        <Link
          href="/rundowns/new"
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium transition-colors"
        >
          + New Rundown
        </Link>
      </div>

      {rundowns.length === 0 ? (
        <p className="text-gray-400 p-8">No rundowns yet. Create one to get started!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-8">
          {rundowns.map((rundown) => (
            <div
              key={rundown.id}
              className="flex flex-col p-4 border border-gray-700 rounded-lg hover:shadow-lg transition bg-gray-800"
            >
              {editingId === rundown.id ? (
                // Edit mode
                <>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-xs text-gray-400">Title</label>
                      <input
                        type="text"
                        value={editData.title || ''}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Description</label>
                      <textarea
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Start Time</label>
                      <div className="relative">
                        <button
                          onClick={handleOpenTimePicker}
                          className="w-full px-3 py-2 border border-gray-600 rounded text-sm text-left hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-700 text-white transition-colors"
                        >
                          {editData.event_date
                            ? (() => {
                                const date = new Date(editData.event_date)
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
                          <div ref={timePickerRef} className="absolute top-full mt-2 left-0 bg-gray-800 border border-gray-700 rounded-lg p-3 z-50 shadow-lg min-w-[280px]">
                          <div className="space-y-2">
                            <div className="grid grid-cols-4 gap-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400 text-center">Hours</label>
                                <select
                                  value={pickerHours}
                                  onChange={(e) => setPickerHours(e.target.value)}
                                  className="px-1 py-1 border border-gray-600 rounded text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-700 text-white"
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
                                <label className="text-xs text-gray-400 text-center">Minutes</label>
                                <select
                                  value={pickerMinutes}
                                  onChange={(e) => setPickerMinutes(e.target.value)}
                                  className="px-1 py-1 border border-gray-600 rounded text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-700 text-white"
                                >
                                  {Array.from({ length: 60 }, (_, i) => (
                                    <option key={i} value={i.toString().padStart(2, '0')}>
                                      {i.toString().padStart(2, '0')}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400 text-center">Seconds</label>
                                <select
                                  value={pickerSeconds}
                                  onChange={(e) => setPickerSeconds(e.target.value)}
                                  className="px-1 py-1 border border-gray-600 rounded text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-700 text-white"
                                >
                                  {Array.from({ length: 60 }, (_, i) => (
                                    <option key={i} value={i.toString().padStart(2, '0')}>
                                      {i.toString().padStart(2, '0')}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400 text-center">AM/PM</label>
                                <select
                                  value={pickerAmPm}
                                  onChange={(e) => setPickerAmPm(e.target.value as 'AM' | 'PM')}
                                  className="px-1 py-1 border border-gray-600 rounded text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-700 text-white"
                                >
                                  <option value="AM">AM</option>
                                  <option value="PM">PM</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={handleSaveTime}
                                className="flex-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setShowTimePicker(false)}
                                className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}                      </div>                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={handleSave}
                      className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-medium transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 px-3 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                // View mode
                <>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white">
                      {rundown.title}
                    </h3>
                    {rundown.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mt-2">
                        {rundown.description}
                      </p>
                    )}
                    {rundown.event_date && (
                      <p className="text-xs text-gray-400 mt-2 font-mono">
                        <span className="text-gray-500">Start Time: </span>
                        {(() => {
                          const date = new Date(rundown.event_date)
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
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                    <Link
                      href={`/rundowns/${rundown.id}/edit`}
                      className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm font-medium transition-colors text-center"
                    >
                      Go Live
                    </Link>
                    <button
                      onClick={() => handleEdit(rundown)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rundown.id, rundown.title)}
                      disabled={deleting === rundown.id}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-800 disabled:text-gray-400 text-sm font-medium transition-colors"
                    >
                      {deleting === rundown.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
