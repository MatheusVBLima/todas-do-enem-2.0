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

// Proof (Exam with PDF metadata)
export interface Proof {
  id: string
  year: number
  color: string | null
  testDate: string | null
  season: string | null
  pdfUrl: string | null
  description: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface ProofFilters {
  anos?: number[]
  tipo?: '1º dia' | '2º dia' | 'COMPLETA'
  pagina?: number
}

// Simulado types
export type SimuladoStatus = 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ABANDONADO'
export type SimuladoSourceType = 'HOME' | 'GROUP' | 'REFAZER'
export type AnswerOption = 'A' | 'B' | 'C' | 'D' | 'E'

export interface Simulado {
  id: string
  userId: string
  name: string
  totalQuestions: number
  timeLimit: number | null
  appliedFilters: unknown
  sourceType: string
  sourceGroupId: string | null
  status: string
  createdAt: string
  startedAt: string
  completedAt: string | null
  updatedAt: string
}

export interface SimuladoQuestao {
  simuladoId: string
  questionId: string
  position: number
  userAnswer: string | null
  isCorrect: boolean | null
  answeredAt: string | null
}

export interface SimuladoResultado {
  id: string
  simuladoId: string
  totalScore: number
  correctAnswers: number
  wrongAnswers: number
  unansweredQuestions: number
  scoreByArea: Record<string, { correct: number; total: number; percentage: number }>
  timeTaken: number | null
  completedAt: string
  createdAt: string
}

// Simulado with relations
export interface SimuladoWithQuestions extends Simulado {
  questions: (SimuladoQuestao & { question: QuestionWithExam })[]
}

export interface SimuladoWithResult extends Simulado {
  resultado: SimuladoResultado | null
}

// Create simulado params
export interface CreateSimuladoParams {
  userId: string
  name: string
  filters: QuestionFilters
  timeLimit?: number
  sourceType: SimuladoSourceType
  sourceGroupId?: string
}

export interface SubmitAnswerParams {
  simuladoId: string
  questionId: string
  answer: AnswerOption
}
