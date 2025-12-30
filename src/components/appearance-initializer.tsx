"use client"

import { useEffect } from "react"
import { useAppearance } from "@/hooks/use-appearance"

/**
 * Component that initializes appearance settings on mount.
 * This ensures the theme is applied before the first render.
 */
export function AppearanceInitializer() {
  const { mounted } = useAppearance()

  // This component doesn't render anything, it just initializes the hook
  useEffect(() => {
    // The hook will apply settings automatically on mount
  }, [])

  return null
}

