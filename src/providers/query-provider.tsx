"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos - dados permanecem fresh por mais tempo
            gcTime: 1000 * 60 * 60, // 1 hora - garbage collection (maior que antes)
            refetchOnWindowFocus: false,
            refetchOnReconnect: false, // Evita refetch ao reconectar
            retry: 2, // 2 tentativas em caso de erro
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
