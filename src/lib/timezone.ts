/**
 * Utilities for handling Brazilian timezone (America/Sao_Paulo)
 */

export function getTodayBrazil(): Date {
  const now = new Date()
  // Adjust for Brazil's timezone (UTC-3, or UTC-2 during daylight saving)
  // Brazil typically observes DST from October to February
  const brasilOffset = -3 * 60 // UTC-3 in minutes
  return new Date(now.getTime() + (brasilOffset - now.getTimezoneOffset()) * 60000)
}

export function todayBrazilISOString(): string {
  const today = getTodayBrazil()
  today.setHours(0, 0, 0, 0)
  return today.toISOString()
}

export function todayBrazilDateString(): string {
  const today = getTodayBrazil()
  today.setHours(0, 0, 0, 0)
  return today.toISOString().split('T')[0]
}
