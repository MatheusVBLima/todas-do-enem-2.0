import { Suspense } from "react"
import { QueryClient, HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { notFound } from "next/navigation"
import { ProofViewerContent } from "./proof-viewer-content"
import { getProof, getAllProofIds } from "@/server/actions/proofs"
import { queryKeys } from "@/lib/query-keys"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// Generate static params for all proofs at build time
export async function generateStaticParams() {
  const proofIds = await getAllProofIds()
  return proofIds.map((id) => ({ id }))
}

export default async function ProofViewPage({ params }: PageProps) {
  const { id } = await params

  // Fetch proof data on server
  const result = await getProof(id)

  if (!result.success || !result.data) {
    notFound()
  }

  // Prefetch data
  const queryClient = new QueryClient()
  queryClient.setQueryData(queryKeys.proofs.detail(id), result)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="container mx-auto py-6">
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-[600px] bg-muted animate-pulse rounded" />
            </div>
          }
        >
          <ProofViewerContent proofId={id} />
        </Suspense>
      </div>
    </HydrationBoundary>
  )
}
