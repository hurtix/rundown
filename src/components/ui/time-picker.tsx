"use client"

import React from "react"

interface TimePickerProps {
  value?: string // Format: "HH:MM"
  onChange?: (time: string) => void
}

export function TimePicker({ value = "00:00", onChange }: TimePickerProps) {
  const [hours, minutes] = value.split(":").map(Number)

  const handleHourChange = (newHour: number) => {
    const h = String(newHour).padStart(2, "0")
    const m = String(minutes).padStart(2, "0")
    onChange?.(`${h}:${m}`)
  }

  const handleMinuteChange = (newMinute: number) => {
    const h = String(hours).padStart(2, "0")
    const m = String(newMinute).padStart(2, "0")
    onChange?.(`${h}:${m}`)
  }

  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i)

  return (
    <div className="flex gap-3 items-center">
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-xs text-slate-400 font-medium">Hour</label>
        <select
          value={hours}
          onChange={(e) => handleHourChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {hourOptions.map((hour) => (
            <option key={hour} value={hour}>
              {String(hour).padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>

      <div className="text-slate-400 text-xl font-bold pt-6">:</div>

      <div className="flex flex-col gap-1 flex-1">
        <label className="text-xs text-slate-400 font-medium">Minute</label>
        <select
          value={minutes}
          onChange={(e) => handleMinuteChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {minuteOptions.map((minute) => (
            <option key={minute} value={minute}>
              {String(minute).padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
