"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface LivePageProps {
  params: {
    id: string
  }
}

export default function RundownLivePage({ params }: LivePageProps) {
  const router = useRouter()

  useEffect(() => {
    // Redirect to edit page since we're moving all functionality there
    router.push(`/rundowns/${params.id}/edit`)
  }, [params.id, router])

  return null
}
