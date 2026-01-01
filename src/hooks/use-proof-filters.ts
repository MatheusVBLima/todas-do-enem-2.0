"use client"

import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from "nuqs"

/**
 * Hook for managing proof filters in URL
 * Syncs filter state to URL query parameters
 */
export function useProofFilters() {
  return useQueryStates({
    anos: parseAsArrayOf(parseAsInteger).withDefault([]),
    tipo: parseAsString as any, // Allow '1º dia' | '2º dia' | 'COMPLETA' | null
    pagina: parseAsInteger.withDefault(1),
  })
}
