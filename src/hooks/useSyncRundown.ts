import { useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useRundown } from "@/context/RundownContext"
import { Cue } from "@/modules/rundown/types"

export function useSyncRundown(rundownId: string | null) {
  const { addCue, updateCue, deleteCue } = useRundown()

  const handleRealtimeEvent = useCallback(
    (payload: any) => {
      const { eventType, new: newData, old: oldData } = payload

      if (newData && newData.rundown_id !== rundownId) return

      switch (eventType) {
        case "INSERT":
          addCue(newData as Cue)
          break
        case "UPDATE":
          updateCue(newData.id, newData as Partial<Cue>)
          break
        case "DELETE":
          deleteCue(oldData.id)
          break
      }
    },
    [rundownId, addCue, updateCue, deleteCue]
  )

  useEffect(() => {
    if (!rundownId) return

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`rundown:${rundownId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Cue",
          filter: `rundown_id=eq.${rundownId}`,
        },
        handleRealtimeEvent
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [rundownId, handleRealtimeEvent])
}
