"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { EssayCorrection } from "./essay-correction"
import { getEssay } from "@/server/actions/essays"
import { queryKeys } from "@/lib/query-keys"

interface EssayCorrectionClientProps {
  essayId: string
  userId: string
  userPlan: string
}

export function EssayCorrectionClient({ essayId, userId, userPlan }: EssayCorrectionClientProps) {
  const { data: essay } = useSuspenseQuery({
    queryKey: queryKeys.essays.detail(essayId),
    queryFn: async () => {
      const result = await getEssay(essayId)

      if (!result.success || !result.data) {
        throw new Error(result.error || "Essay not found")
      }

      return result.data
    },
  })

  // Verify ownership
  if (essay.userId !== userId) {
    notFound()
  }

  return <EssayCorrection essay={essay} userId={userId} userPlan={userPlan} />
}
