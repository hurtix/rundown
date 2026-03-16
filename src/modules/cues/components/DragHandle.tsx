"use client"

import React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { GripVertical } from "lucide-react"

interface DragHandleProps {
  id: string
}

export function DragHandle({ id }: DragHandleProps) {
  const { attributes, listeners } = useSortable({ id })

  return (
    <div
      {...attributes}
      {...listeners}
      className={`w-7 flex-none flex items-center justify-center transition-opacity cursor-grab active:cursor-grabbing opacity-70 hover:opacity-100`}
    >
      <GripVertical className="w-4 h-4 text-white" />
    </div>
  )
}
