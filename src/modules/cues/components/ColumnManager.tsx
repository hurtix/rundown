"use client"

import React, { useState } from "react"

export interface ColumnConfig {
  id: string
  label: string
  visible: boolean
}

interface ColumnManagerProps {
  columns: ColumnConfig[]
  onToggleColumn: (columnId: string) => void
}

export default function ColumnManager({ columns, onToggleColumn }: ColumnManagerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Manage columns"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 3v2m6-2v2M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2m0 0V3m0 2V5m0 10h.01M12 15h.01M15 15h.01M12 11h.01M15 11h.01M9 11h.01"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Display Columns</p>
          </div>
          <div className="p-2 space-y-1">
            {columns.map((column) => (
              <label
                key={column.id}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={column.visible}
                  onChange={() => onToggleColumn(column.id)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{column.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
