"use client"

import Link from "next/link"
import { Rundown } from "@/modules/rundown/types"

interface RundownListProps {
  rundowns: Rundown[]
}

export default function RundownList({ rundowns }: RundownListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rundowns</h2>
        <Link
          href="/rundowns/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          + New Rundown
        </Link>
      </div>

      {rundowns.length === 0 ? (
        <p className="text-gray-500">No rundowns yet. Create one to get started!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rundowns.map((rundown) => (
            <Link
              key={rundown.id}
              href={`/rundowns/${rundown.id}/edit`}
              className="block p-4 border rounded-lg hover:shadow-lg transition bg-white"
            >
              <h3 className="font-semibold text-lg text-gray-900">
                {rundown.title}
              </h3>
              {rundown.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {rundown.description}
                </p>
              )}
              {rundown.event_date && (
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(rundown.event_date).toLocaleDateString()}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
