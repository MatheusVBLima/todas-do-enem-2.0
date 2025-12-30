"use client"

import { NuqsAdapter } from "nuqs/adapters/next/app"
import { QueryProvider } from "./query-provider"
import { ThemeProvider } from "./theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AppearanceInitializer } from "@/components/appearance-initializer"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-mode"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AppearanceInitializer />
      <NuqsAdapter>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </NuqsAdapter>
    </ThemeProvider>
  )
}
