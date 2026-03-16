"use client"

import { useEffect } from "react"
import { listCuesByRundown } from "@/server/cueActions"
import { getRundown } from "@/server/rundownActions"
import { RundownProvider, useRundown } from "@/context/RundownContext"
import { useSyncRundown } from "@/hooks/useSyncRundown"
import LiveView from "@/modules/cues/components/LiveView"
import Link from "next/link"

interface LivePageProps {
  params: {
    id: string
  }
}

function LivePageContent({ rundownId }: { rundownId: string }) {
  const { setRundown, cues, setCues } = useRundown()
  useSyncRundown(rundownId)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rundownData, cuesData] = await Promise.all([
          getRundown(rundownId),
          listCuesByRundown(rundownId),
        ])

        if (rundownData) {
          // No need to convert - Server Actions already return ISO strings
          setRundown(rundownData)
          setCues(cuesData)
        }
      } catch (error) {
        console.error("Failed to load rundown:", error)
      }
    }

    loadData()
  }, [rundownId, setRundown, setCues])

  return (
    <>
      <div className="absolute top-4 left-4 z-10">
        <Link
          href={`/rundowns/${rundownId}/edit`}
          className="px-4 py-2 bg-white text-gray-900 rounded text-sm font-medium hover:bg-gray-100"
        >
          ← Edit Rundown
        </Link>
      </div>
      <LiveView cues={cues} />
    </>
  )
}

export default function RundownLivePage({ params }: LivePageProps) {
  return (
    <RundownProvider>
      <LivePageContent rundownId={params.id} />
    </RundownProvider>
  )
}
