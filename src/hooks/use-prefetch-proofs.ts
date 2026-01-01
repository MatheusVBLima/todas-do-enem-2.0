"use client"

import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { getProofs, getProof } from "@/server/actions/proofs"
import type { ProofFilters } from "@/types"

/**
 * Hook for prefetching proofs list
 * Helps with navigation performance
 */
export function usePrefetchProofs() {
  const queryClient = useQueryClient()

  const prefetchProofsList = (filters: ProofFilters) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.proofs.list(filters),
      queryFn: () => getProofs(filters),
    })
  }

  const prefetchProofDetail = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.proofs.detail(id),
      queryFn: () => getProof(id),
    })
  }

  return {
    prefetchProofsList,
    prefetchProofDetail,
  }
}
