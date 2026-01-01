import { google } from "@ai-sdk/google"

// Gemini 2.5 Flash - 70% mais barato que 3.0 Flash
// Input: $0.15/1M tokens | Output: $0.60/1M tokens
export const geminiModel = google("gemini-2.5-flash")
