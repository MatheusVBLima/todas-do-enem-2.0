import type { QuestionFilters, ProofFilters } from "@/types"

/**
 * Centralized query keys for TanStack Query
 * Benefits:
 * - Type-safe query keys
 * - Easy hierarchical invalidation
 * - Prevents typos
 * - Better organization
 */
export const queryKeys = {
  // Questions
  questions: {
    all: ["questions"] as const,
    lists: () => [...queryKeys.questions.all, "list"] as const,
    list: (filters: QuestionFilters) =>
      [...queryKeys.questions.lists(), filters] as const,
    details: () => [...queryKeys.questions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.questions.details(), id] as const,
  },

  // Groups
  groups: {
    all: ["groups"] as const,
    lists: () => [...queryKeys.groups.all, "list"] as const,
    list: (userId: string) => [...queryKeys.groups.lists(), userId] as const,
    details: () => [...queryKeys.groups.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.groups.details(), id] as const,
  },

  // Years (for filters)
  years: {
    all: ["years"] as const,
  },

  // Essays
  essays: {
    all: ["essays"] as const,
    lists: () => [...queryKeys.essays.all, "list"] as const,
    list: (userId: string) => [...queryKeys.essays.lists(), userId] as const,
    details: () => [...queryKeys.essays.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.essays.details(), id] as const,
  },

  // Proofs
  proofs: {
    all: ["proofs"] as const,
    lists: () => [...queryKeys.proofs.all, "list"] as const,
    list: (filters: ProofFilters) => [...queryKeys.proofs.lists(), filters] as const,
    details: () => [...queryKeys.proofs.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.proofs.details(), id] as const,
  },
} as const
