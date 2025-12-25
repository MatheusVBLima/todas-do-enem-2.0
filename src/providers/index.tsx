"use client"

import { NuqsAdapter } from "nuqs/adapters/next/app"
import { QueryProvider } from "./query-provider"
import { ThemeProvider } from "./theme-provider"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NuqsAdapter>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </NuqsAdapter>
    </ThemeProvider>
  )
}
