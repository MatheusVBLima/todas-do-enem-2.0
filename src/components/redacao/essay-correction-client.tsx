"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { EssayCorrection } from "./essay-correction"
import { getEssay } from "@/server/actions/essays"
import { queryKeys } from "@/lib/query-keys"

interface EssayCorrectionClientProps {
  essayId: string
  userId: string
}

export function EssayCorrectionClient({ essayId, userId }: EssayCorrectionClientProps) {
  // useSuspenseQuery suspends until data is ready
  const { data: result } = useSuspenseQuery({
    queryKey: queryKeys.essays.detail(essayId),
    queryFn: () => getEssay(essayId),
  })

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
