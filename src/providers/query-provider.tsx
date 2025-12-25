"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos - dados permanecem fresh por mais tempo
            gcTime: 10 * 60 * 1000, // 10 minutos - garbage collection
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Evita refetch se dados estão fresh
            retry: 1, // Reduz tentativas de retry
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
