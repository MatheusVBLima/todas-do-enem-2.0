import type { Question, QuestionGroup, Essay, EssayCorrection, User, Exam } from '@/lib/supabase/types'

// Re-export Supabase types
export type { Question, QuestionGroup, Essay, EssayCorrection, User, Exam }

// Question with relations
export type QuestionWithExam = Question & {
  exam: Exam
}

export type QuestionWithGroups = Question & {
  groups: { groupId: string }[]
}

export type QuestionFull = Question & {
  exam: Exam
  groups: { groupId: string; group: QuestionGroup }[]
}

// Group with relations
export type QuestionGroupWithQuestions = QuestionGroup & {
  questions: { question: Question }[]
  _count?: { questions: number }
}

// Essay with relations
export type EssayWithCorrections = Essay & {
  corrections: EssayCorrection[]
}

// Filters
export interface QuestionFilters {
  anos?: number[]
  areas?: string[]
  disciplinas?: string[]
  busca?: string
  pagina?: number
}

export interface SavedFilters {
  anos?: number[]
  areas?: string[]
  disciplinas?: string[]
  busca?: string
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// API Response types
export interface ActionResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

// AI types
export interface AIExplanation {
  explanation: string
  generatedAt: Date
}

export interface EssayFeedback {
  competencia1: number
  competencia2: number
  competencia3: number
  competencia4: number
  competencia5: number
  totalScore: number
  feedback: string
  suggestions?: string[]
}

// Form types
export interface CreateGroupInput {
  name: string
  description?: string
  color?: string
  savedFilters?: SavedFilters
}

export interface UpdateGroupInput {
  name?: string
  description?: string
  color?: string
  savedFilters?: SavedFilters
}

export interface CreateEssayInput {
  title?: string
  theme?: string
  content: string
}

export interface UpdateEssayInput {
  title?: string
  theme?: string
  content?: string
}
