import { listRundowns } from "@/server/rundownActions"
import RundownList from "@/modules/rundown/components/RundownList"

export const dynamic = "force-dynamic"

export default async function RundownsPage() {
  const rundowns = await listRundowns()

  return (
    <main className="min-h-screen bg-gray-900">
      <RundownList rundowns={rundowns} />
    </main>
  )
}
