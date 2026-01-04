"use client"

import { useEffect, useState } from "react"

export type ThemeName = "default" | "notebook" | "haze" | "ghibli" | "twitter" | "violeta" | "neutro" | "musgo" | "supabase"
export type ThemeMode = "light" | "dark"
export type FontFamily = "sans" | "serif" | "mono"

interface AppearanceSettings {
  theme: ThemeName
  mode: ThemeMode
  font: FontFamily
}

const STORAGE_KEY = "appearance-settings"

const DEFAULT_SETTINGS: AppearanceSettings = {
  theme: "default",
  mode: "light",
  font: "sans",
}

export function useAppearance() {
  const [settings, setSettings] = useState<AppearanceSettings>(DEFAULT_SETTINGS)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AppearanceSettings
        setSettings(parsed)
        applySettings(parsed)
      } catch (error) {
        console.error("Error parsing appearance settings:", error)
      }
    } else {
      // Check system preference for initial mode
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const initialSettings = {
        ...DEFAULT_SETTINGS,
        mode: prefersDark ? "dark" as ThemeMode : "light" as ThemeMode,
      }
      setSettings(initialSettings)
      applySettings(initialSettings)
    }
  }, [])

  const applySettings = (newSettings: AppearanceSettings) => {
    const root = document.documentElement

    // Apply mode (light/dark)
    if (newSettings.mode === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    // Apply theme
    root.setAttribute("data-theme", newSettings.theme)

    // Apply font
    root.setAttribute("data-font", newSettings.font)
  }

  const updateSettings = (partial: Partial<AppearanceSettings>) => {
    const newSettings = { ...settings, ...partial }
    setSettings(newSettings)
    applySettings(newSettings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
  }

  const setTheme = (theme: ThemeName) => updateSettings({ theme })
  const setMode = (mode: ThemeMode) => updateSettings({ mode })
  const setFont = (font: FontFamily) => updateSettings({ font })

  return {
    settings,
    setTheme,
    setMode,
    setFont,
    updateSettings,
    mounted,
  }
}
