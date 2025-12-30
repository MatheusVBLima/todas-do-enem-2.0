"use client"

import { useQuery } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { EssayCorrection } from "./essay-correction"
import { getEssay } from "@/server/actions/essays"
import { queryKeys } from "@/lib/query-keys"

interface EssayCorrectionClientProps {
  essayId: string
  userId: string
}

export function EssayCorrectionClient({ essayId, userId }: EssayCorrectionClientProps) {
  const { data: result, isPending } = useQuery({
    queryKey: queryKeys.essays.detail(essayId),
    queryFn: () => getEssay(essayId),
    placeholderData: (prev) => prev,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  if (isPending && !result) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 rounded bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded bg-muted animate-pulse" />
        <div className="h-64 w-full rounded bg-muted animate-pulse" />
      </div>
    )
  }

  if (!result?.success || !result.data) {
    notFound()
  }

  const essay = result.data

  // Verify ownership
  if (essay.userId !== userId) {
    notFound()
  }

  return <EssayCorrection essay={essay} userId={userId} />
}
