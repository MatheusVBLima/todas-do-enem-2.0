/**
 * Supabase types - Export types from database.types.ts
 */

import type { Database } from './database.types'

// Base types from Supabase
export type User = Database['public']['Tables']['User']['Row']
export type Exam = Database['public']['Tables']['Exam']['Row']
export type Question = Database['public']['Tables']['Question']['Row']
export type QuestionGroup = Database['public']['Tables']['QuestionGroup']['Row']
export type QuestionsOnGroups = Database['public']['Tables']['QuestionsOnGroups']['Row']
export type Essay = Database['public']['Tables']['Essay']['Row']
export type EssayCorrection = Database['public']['Tables']['EssayCorrection']['Row']
export type AIUsage = Database['public']['Tables']['AIUsage']['Row']
export type UserAIQuota = Database['public']['Tables']['UserAIQuota']['Row']

// Insert types (for mutations)
export type UserInsert = Database['public']['Tables']['User']['Insert']
export type ExamInsert = Database['public']['Tables']['Exam']['Insert']
export type QuestionInsert = Database['public']['Tables']['Question']['Insert']
export type QuestionGroupInsert = Database['public']['Tables']['QuestionGroup']['Insert']
export type EssayInsert = Database['public']['Tables']['Essay']['Insert']
export type EssayCorrectionInsert = Database['public']['Tables']['EssayCorrection']['Insert']
export type AIUsageInsert = Database['public']['Tables']['AIUsage']['Insert']
export type UserAIQuotaInsert = Database['public']['Tables']['UserAIQuota']['Insert']

// Update types (for mutations)
export type AIUsageUpdate = Database['public']['Tables']['AIUsage']['Update']
export type QuestionUpdate = Database['public']['Tables']['Question']['Update']
export type QuestionGroupUpdate = Database['public']['Tables']['QuestionGroup']['Update']
export type EssayUpdate = Database['public']['Tables']['Essay']['Update']
export type UserAIQuotaUpdate = Database['public']['Tables']['UserAIQuota']['Update']
export type UserUpdate = Database['public']['Tables']['User']['Update']

// Export Database type
export type { Database }
