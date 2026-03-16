"use client"

import { useEffect } from "react"
import { listCuesByRundown } from "@/server/cueActions"
import { getRundown as getRundownData } from "@/server/rundownActions"
import { listSegmentsByRundown } from "@/server/segmentActions"
import { RundownProvider, useRundown } from "@/context/RundownContext"
import RundownHeader from "@/modules/rundown/components/RundownHeader"
import { CueDataTable } from "@/modules/cues/components/CueDataTable"
import Link from "next/link"

interface RundownEditPageProps {
  params: {
    id: string
  }
}

function EditPageContent({ rundownId }: { rundownId: string }) {
  const { rundown, setRundown, setCues, setSegments, setActiveRundownId } = useRundown()

  // Set active rundown ID to enable localStorage persistence
  useEffect(() => {
    setActiveRundownId(rundownId)
    return () => {
      setActiveRundownId(null)
    }
  }, [rundownId, setActiveRundownId])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rundownData, cuesData, segmentsData] = await Promise.all([
          getRundownData(rundownId),
          listCuesByRundown(rundownId),
          listSegmentsByRundown(rundownId),
        ])

        if (rundownData) {
          // No need to convert - Server Actions already return ISO strings
          setRundown(rundownData)
          setCues(cuesData)
          setSegments(segmentsData)
        }
      } catch (error) {
        console.error("Failed to load rundown:", error)
      }
    }

    loadData()
  }, [rundownId, setRundown, setCues, setSegments])

  return (
    <main className="flex flex-col h-screen bg-black text-white">
      <header className="bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <div className="w-full p-8 flex justify-between items-center">
          <Link href="/rundowns" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
            ← Back
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col">
        <div className="p-8 flex-shrink-0 border-b border-slate-800">
          {rundown ? (
            <RundownHeader rundown={rundown} />
          ) : (
            <div className="text-slate-400">Loading rundown...</div>
          )}
        </div>

        <div className="flex-1 p-8">
          <CueDataTable rundownId={rundownId} />
        </div>
      </div>
    </main>
  )
}

export default function RundownEditPage({ params }: RundownEditPageProps) {
  return (
    <RundownProvider>
      <EditPageContent rundownId={params.id} />
    </RundownProvider>
  )
}
