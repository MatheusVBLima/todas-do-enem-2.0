import { notFound } from "next/navigation"
import { getEssay } from "@/server/actions/essays"
import { EssayCorrection } from "@/components/redacao/essay-correction"
import { getCurrentUser, hasPaidPlan } from "@/lib/dev-user"
import { redirect } from "next/navigation"

interface EssayDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EssayDetailPage({ params }: EssayDetailPageProps) {
  const { id } = await params

  // Check if user has access
  const user = getCurrentUser()
  const isPaidUser = hasPaidPlan(user.plan)

  if (!isPaidUser) {
    redirect("/redacao")
  }

  // Get essay
  const result = await getEssay(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const essay = result.data

  // Verify ownership
  if (essay.userId !== user.id) {
    notFound()
  }

  return <EssayCorrection essay={essay} userId={user.id} />
}
