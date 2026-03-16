"use client"

import React, { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface EditableProductionFieldProps {
  value: string | null
  onSave: (newValue: string | null) => Promise<void>
  placeholder?: string
  availableOptions?: string[]
}

export function EditableProductionField({
  value,
  onSave,
  placeholder = "Add item...",
  availableOptions = [],
}: EditableProductionFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const items = value ? value.split(",").map((item) => item.trim()).filter(Boolean) : []

  useEffect(() => {
    if (!isEditing) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsEditing(false)
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isEditing])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleInputChange = (e: string) => {
    setInputValue(e)
    if (e.length > 0) {
      const filtered = availableOptions.filter(
        (opt) =>
          opt.toLowerCase().includes(e.toLowerCase()) && !items.includes(opt)
      )
      setFilteredOptions(filtered)
      setShowDropdown(true)
    } else {
      setFilteredOptions([])
      setShowDropdown(false)
    }
  }

  const handleSelectOption = (option: string) => {
    const newItems = [...items, option]
    handleSave(newItems)
    setInputValue("")
    setShowDropdown(false)
  }

  const handleAddNew = () => {
    if (inputValue.trim()) {
      const newItems = [...items, inputValue.trim()]
      handleSave(newItems)
      setInputValue("")
      setShowDropdown(false)
    }
  }

  const handleRemoveItem = (item: string) => {
    const newItems = items.filter((i) => i !== item)
    handleSave(newItems)
  }

  const handleSave = async (newItems: string[]) => {
    const newValue = newItems.length > 0 ? newItems.join(", ") : null
    try {
      await onSave(newValue)
    } catch (error) {
      console.error("Error saving production field:", error)
    }
  }

  return (
    <div ref={containerRef} className="flex-1 relative">
      {!isEditing ? (
        <div
          onClick={() => setIsEditing(true)}
          className="min-h-[40px] p-2 cursor-pointer hover:bg-slate-700/50 rounded transition-colors flex flex-wrap gap-2 items-center"
        >
          {items.length > 0 ? (
            items.map((item) => (
              <Badge key={item} variant="secondary" className="bg-white text-black hover:bg-slate-100">
                {item}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-slate-400">{placeholder}</span>
          )}
        </div>
      ) : (
        <div className="p-2 space-y-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {items.map((item) => (
              <Badge key={item} variant="default" className="bg-emerald-600 hover:bg-emerald-700 pl-3 pr-1.5 py-1">
                <span className="mr-1">{item}</span>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddNew()
                } else if (e.key === "Escape") {
                  setIsEditing(false)
                  setShowDropdown(false)
                }
              }}
              placeholder={placeholder}
              className="w-full px-2 py-1 border border-slate-600 rounded bg-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {showDropdown && inputValue.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded shadow-lg z-50 max-h-40 overflow-y-auto">
                {filteredOptions.length > 0 && (
                  <>
                    {filteredOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelectOption(option)}
                        className="w-full text-left px-2 py-1 hover:bg-slate-700 text-xs text-white transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                    <div className="border-t border-slate-600" />
                  </>
                )}
                {inputValue.trim() && !items.includes(inputValue.trim()) && (
                  <button
                    onClick={handleAddNew}
                    className="w-full text-left px-2 py-1 hover:bg-slate-700 text-xs text-emerald-400 transition-colors font-medium"
                  >
                    + Create "{inputValue.trim()}"
                  </button>
                )}
              </div>
            )}

            {inputValue.trim() && !filteredOptions.length && (
              <button
                onClick={handleAddNew}
                className="absolute top-full left-0 right-0 mt-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs text-emerald-400 hover:bg-slate-700 transition-colors font-medium"
              >
                + Create "{inputValue.trim()}"
              </button>
            )}
          </div>

          <div className="flex gap-1 pt-1">
            <button
              onClick={() => {
                setIsEditing(false)
                setShowDropdown(false)
              }}
              className="flex-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
