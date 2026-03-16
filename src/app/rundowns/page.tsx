import { listRundowns } from "@/server/rundownActions"
import RundownList from "@/modules/rundown/components/RundownList"

export const dynamic = "force-dynamic"

export default async function RundownsPage() {
  const rundowns = await listRundowns()

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <RundownList rundowns={rundowns} />
      </div>
    </main>
  )
}
