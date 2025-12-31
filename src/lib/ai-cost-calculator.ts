/**
 * AI Cost Calculator
 *
 * Calculates costs based on Gemini 3.0 Flash pricing (2025):
 * - Input: $0.50 per 1M tokens
 * - Output: $3.00 per 1M tokens
 * - BRL conversion rate: ~R$5.50 per USD (approximate, hardcoded)
 *
 * Uses native Vercel AI SDK usage metadata (LanguageModelUsage)
 */

// Gemini 3.0 Flash pricing (USD)
const GEMINI_FLASH_INPUT_COST_PER_1M = 0.50
const GEMINI_FLASH_OUTPUT_COST_PER_1M = 3.00

// USD to BRL conversion rate (approximate)
const USD_TO_BRL = 5.50

/**
 * Token usage from Vercel AI SDK
 * Native type from AI SDK: LanguageModelUsage
 */
export interface TokenUsage {
  inputTokens: number | undefined
  outputTokens: number | undefined
  totalTokens: number | undefined
}

/**
 * Detailed cost breakdown in USD and BRL
 */
export interface CostBreakdown {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  inputCostUSD: number
  outputCostUSD: number
  totalCostUSD: number
  totalCostBRL: number
}

/**
 * Calculate cost from token usage
 *
 * @param usage - Token usage object from AI SDK result.usage
 * @returns Detailed cost breakdown
 *
 * @example
 * ```ts
 * const result = await streamText({ ... })
 * const usage = await result.usage
 * const cost = calculateAICost(usage)
 * console.log(cost.totalCostBRL) // 0.00294
 * ```
 */
export function calculateAICost(usage: TokenUsage): CostBreakdown {
  // Handle undefined values (fallback to 0)
  const inputTokens = usage.inputTokens ?? 0
  const outputTokens = usage.outputTokens ?? 0
  const totalTokens = usage.totalTokens ?? (inputTokens + outputTokens)

  const inputCostUSD = (inputTokens / 1_000_000) * GEMINI_FLASH_INPUT_COST_PER_1M
  const outputCostUSD = (outputTokens / 1_000_000) * GEMINI_FLASH_OUTPUT_COST_PER_1M
  const totalCostUSD = inputCostUSD + outputCostUSD
  const totalCostBRL = totalCostUSD * USD_TO_BRL

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    inputCostUSD,
    outputCostUSD,
    totalCostUSD,
    totalCostBRL,
  }
}

/**
 * Estimate tokens from text (rough approximation: 4 chars = 1 token)
 *
 * NOTE: This is a rough estimate. Use actual usage from AI SDK when available.
 *
 * @param text - Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
