"use server"

import { supabase } from "@/lib/supabase/server"
import { PAGINATION } from "@/lib/constants"
import type { QuestionFilters, PaginatedResponse, QuestionWithExam, QuestionFull } from "@/types"
import {
  loadLocalQuestions,
  getLocalQuestion,
  getAvailableLocalYears,
  getAvailableLocalExamsForYear,
  type LocalQuestion
} from "@/lib/questions/local-questions"

// Module-level cache for local questions (resets on server restart)
let localQuestionsCache: QuestionWithExam[] | null = null

// Helper to flatten supportingMaterials blocks into component format
interface SupportingMaterialBlock {
  id: string
  type: string
  content?: string
  url?: string
  alt?: string
  caption?: string
  metadata?: {
    source?: string
  }
}

interface LocalSupportingMaterial {
  id: string
  blocks: SupportingMaterialBlock[]
  order: number
}

function flattenSupportingMaterials(materials: LocalSupportingMaterial[]): any[] {
  if (!materials || materials.length === 0) {
    return []
  }

  const flattened: any[] = []

  for (const material of materials) {
    for (const block of material.blocks) {
      if (block.type === 'paragraph' && block.content) {
        flattened.push({
          type: 'text',
          content: block.content,
          metadata: block.metadata,
        })
      } else if (block.type === 'image' && block.url) {
        flattened.push({
          type: 'image',
          url: block.url,
          alt: block.alt || 'Imagem da questão',
          caption: block.caption,
        })
      }
    }
  }

  return flattened
}

// Helper to convert local question format to QuestionWithExam format
function convertLocalToQuestionWithExam(
  localQuestion: LocalQuestion,
  exam: { id: string; year: number; day: number; color: string; area: string }
): QuestionWithExam {
  return {
    ...localQuestion,
    // Map alternatives to individual option fields
    optionA: localQuestion.alternatives.A,
    optionB: localQuestion.alternatives.B,
    optionC: localQuestion.alternatives.C,
    optionD: localQuestion.alternatives.D,
    optionE: localQuestion.alternatives.E,
    // Flatten supportingMaterials blocks
    supportingMaterials: flattenSupportingMaterials(localQuestion.supportingMaterials as any),
    // Map other fields
    knowledgeArea: localQuestion.area,
    questionNumber: localQuestion.number,
    examId: exam.id,
    aiExplanation: null,
    context: null,
    imageUrl: null,
    exam: {
      ...exam,
      createdAt: null,
      description: null,
      pdfUrl: null,
      season: null,
      testDate: null,
      updatedAt: null,
    },
  } as QuestionWithExam
}

// Helper to load ALL local questions from all JSON files with caching
function loadAllLocalQuestions(): QuestionWithExam[] {
  // Return cached data if available
  if (localQuestionsCache !== null) {
    console.log('[LocalQuestions] Using cached questions:', localQuestionsCache.length)
    return localQuestionsCache
  }

  console.log('[LocalQuestions] Loading all local questions from JSON files...')
  const allQuestions: QuestionWithExam[] = []
  const loadedDays = new Set<string>() // Track year-day combinations to avoid duplicates

  // Get all available years
  const allYears = getAvailableLocalYears()

  // Filter based on feature flag
  const isCompleteMode = process.env.NEXT_PUBLIC_FEATURE_FLAG_COMPLETE === 'true'
  const years = isCompleteMode
    ? allYears.filter(year => year >= 2023 && year <= 2025) // Complete: all available data
    : allYears.filter(year => year === 2025) // Limited: 2025 only
  console.log('[LocalQuestions] All years found:', allYears)
  console.log('[LocalQuestions] Feature flag complete mode:', isCompleteMode)
  console.log('[LocalQuestions] Loading years:', years)

  for (const year of years) {
    // Get all exams for this year
    const exams = getAvailableLocalExamsForYear(year)
    console.log(`[LocalQuestions] Year ${year}: Found ${exams.length} exams`)

    for (const { day, color } of exams) {
      const dayKey = `${year}-D${day}`

      // Skip if we already loaded this year-day combination
      if (loadedDays.has(dayKey)) {
        console.log(`[LocalQuestions] Skipping ${year} D${day} ${color} (already loaded this day)`)
        continue
      }

      const localData = loadLocalQuestions(year, day, color)
      if (localData) {
        console.log(`[LocalQuestions] Loaded ${localData.questions.length} questions from ${year} D${day} ${color}`)

        // Convert each question to QuestionWithExam format
        const convertedQuestions = localData.questions.map(q =>
          convertLocalToQuestionWithExam(q, localData.exam)
        )

        allQuestions.push(...convertedQuestions)
        loadedDays.add(dayKey) // Mark this year-day as loaded
      }
    }
  }

  console.log(`[LocalQuestions] Total questions loaded: ${allQuestions.length}`)
  console.log(`[LocalQuestions] Loaded days:`, Array.from(loadedDays).sort())

  // Log distribution by year for debugging
  const yearCounts = allQuestions.reduce((acc, q) => {
    acc[q.exam.year] = (acc[q.exam.year] || 0) + 1
    return acc
  }, {} as Record<number, number>)
  console.log(`[LocalQuestions] Questions per year:`, yearCounts)

  // Cache the loaded questions
  localQuestionsCache = allQuestions

  return allQuestions
}

// Helper to format questions for Supabase-like response
function formatLocalQuestionsForResponse(
  allQuestions: QuestionWithExam[],
  filters: QuestionFilters,
  pageSize: number,
  offset: number
): { data: QuestionWithExam[]; total: number } {
  let filtered = allQuestions

  // Apply filters
  if (filters.anos && filters.anos.length > 0) {
    filtered = filtered.filter(q => filters.anos!.includes(q.exam.year))
  }

  if (filters.areas && filters.areas.length > 0) {
    filtered = filtered.filter(q => filters.areas!.includes(q.knowledgeArea))
  }

  if (filters.disciplinas && filters.disciplinas.length > 0) {
    filtered = filtered.filter(q => {
      const subject = q.subject?.toUpperCase().replace(' ', '_') || ''
      return filters.disciplinas!.some(d => subject.includes(d.toUpperCase().replace(' ', '_')))
    })
  }

  if (filters.busca && filters.busca.trim()) {
    const busca = filters.busca.toLowerCase()
    filtered = filtered.filter(q =>
      q.statement.toLowerCase().includes(busca) ||
      q.optionA?.toLowerCase().includes(busca) ||
      q.optionB?.toLowerCase().includes(busca) ||
      q.optionC?.toLowerCase().includes(busca) ||
      q.optionD?.toLowerCase().includes(busca) ||
      q.optionE?.toLowerCase().includes(busca)
    )
  }

  const total = filtered.length
  const paginated = filtered.slice(offset, offset + pageSize)

  return { data: paginated, total }
}

const USE_LOCAL_QUESTIONS = process.env.USE_LOCAL_QUESTIONS === 'true'

export async function getQuestions(
  filters: QuestionFilters
): Promise<PaginatedResponse<QuestionWithExam>> {
  const { anos, areas, disciplinas, busca, pagina = 1 } = filters
  const pageSize = PAGINATION.DEFAULT_PAGE_SIZE
  const offset = (pagina - 1) * pageSize

  try {
    console.log('[Search] Starting search with filters:', {
      busca: filters.busca?.trim() || null,
      anos: filters.anos && filters.anos.length > 0 ? filters.anos : null,
      areas: filters.areas && filters.areas.length > 0 ? filters.areas : null,
      disciplinas: filters.disciplinas && filters.disciplinas.length > 0 ? filters.disciplinas : null,
      pagina: filters.pagina,
      offset,
      useLocal: USE_LOCAL_QUESTIONS,
    })

    // Use local questions if environment variable is set
    if (USE_LOCAL_QUESTIONS) {
      console.log('[Search] Using LOCAL questions mode')

      // Load all local questions (with caching)
      const allQuestions = loadAllLocalQuestions()

      if (allQuestions.length === 0) {
        console.log('[Search] No local data found, returning empty results')
        return {
          data: [],
          pagination: {
            page: filters.pagina || 1,
            pageSize,
            total: 0,
            totalPages: 0,
            hasMore: false,
          },
        }
      }

      // Apply filters and pagination
      const { data: questions, total } = formatLocalQuestionsForResponse(
        allQuestions,
        filters,
        pageSize,
        offset
      )

      const totalPages = Math.ceil(total / pageSize)

      console.log(`[Search] Returning ${questions.length} questions (page ${filters.pagina || 1} of ${totalPages}, total: ${total})`)

      return {
        data: questions,
        pagination: {
          page: filters.pagina || 1,
          pageSize,
          total,
          totalPages,
          hasMore: (filters.pagina || 1) < totalPages,
        },
      }
    }

    // Original Supabase implementation
    console.log('[Search] Using SUPABASE mode')

    const startTime = Date.now()

    // Call RPC function with trigram search for partial text matching
    const { data, error } = await supabase.rpc('search_questions_with_trigrams', {
      p_busca: busca?.trim() || '',
      p_anos: anos && anos.length > 0 ? anos : undefined,
      p_areas: areas && areas.length > 0 ? areas : undefined,
      p_disciplinas: disciplinas && disciplinas.length > 0 ? disciplinas : undefined,
      p_offset: offset,
      p_limit: pageSize,
    })

    const duration = Date.now() - startTime
    const rows = (data as any[] | null) || []

    console.log('[Search] RPC Response:', {
      hasData: rows.length > 0,
      dataLength: rows.length,
      hasError: !!error,
      error: error,
      firstRow: rows[0] ? {
        id: rows[0].id,
        statement: rows[0].statement?.substring(0, 50),
        totalCount: rows[0].total_count
      } : null
    })

    if (error) {
      console.error('[Search] Error fetching questions:', error)
      console.error('[Search] Error details:', JSON.stringify(error, null, 2))
      throw new Error('Failed to fetch questions')
    }

    console.log('[Search] Query completed in', duration, 'ms')
    console.log('[Search] Results:', {
      found: rows.length || 0,
      totalCount: rows[0]?.total_count || 0,
    })

    // Extract questions and total count
    const questions = rows.map((row: any) => {
      const { total_count, ...question } = row
      return question as QuestionWithExam
    })

    const total = rows[0]?.total_count || 0
    const totalPages = Math.ceil(total / pageSize)

    return {
      data: questions,
      pagination: {
        page: pagina,
        pageSize,
        total,
        totalPages,
        hasMore: pagina < totalPages,
      },
    }
  } catch (error) {
    console.error('Error in getQuestions:', error)
    return {
      data: [],
      pagination: {
        page: pagina,
        pageSize,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    }
  }
}

export async function getQuestion(id: string): Promise<QuestionFull | null> {
  // Check if using local questions mode
  if (USE_LOCAL_QUESTIONS) {
    console.log('[getQuestion] Using LOCAL mode for id:', id)

    // Load all questions (will use cache if available)
    const allQuestions = loadAllLocalQuestions()

    // Find the question by ID
    const question = allQuestions.find(q => q.id === id)

    if (question) {
      console.log('[getQuestion] Found question locally:', id)
      return question as QuestionFull
    }

    console.log('[getQuestion] Question not found locally:', id)
    return null
  }

  // Original Supabase implementation
  try {
    const { data: question, error } = await supabase
      .from('Question')
      .select(`
        *,
        exam:Exam(*),
        groups:QuestionsOnGroups(
          groupId,
          group:QuestionGroup(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching question:', error)
      return null
    }

    const normalizedQuestion = {
      ...question,
      exam: (question as any)?.exam && !(question as any)?.exam?.error ? (question as any).exam : null,
      groups: Array.isArray((question as any)?.groups) ? (question as any).groups : [],
    }

    return normalizedQuestion as QuestionFull
  } catch (error) {
    console.error('Error in getQuestion:', error)
    return null
  }
}

export async function getYearsWithQuestions(): Promise<number[]> {
  // Check if using local questions mode
  if (USE_LOCAL_QUESTIONS) {
    console.log('[getYearsWithQuestions] Using LOCAL mode')
    const localYears = getAvailableLocalYears()

    // Apply feature flag filter
    const isCompleteMode = process.env.NEXT_PUBLIC_FEATURE_FLAG_COMPLETE === 'true'
    return isCompleteMode ? localYears : localYears.filter(year => year === 2025)
  }

  // Original Supabase implementation
  try {
    const { data: exams, error } = await supabase
      .from('Exam')
      .select('year')
      .order('year', { ascending: false })

    if (error) {
      console.error('Error fetching years:', error)
      return []
    }

    // Apply feature flag filter to Supabase results
    const years = (exams || []).map((e) => e.year)
    const isCompleteMode = process.env.NEXT_PUBLIC_FEATURE_FLAG_COMPLETE === 'true'
    return isCompleteMode ? years : years.filter(y => y === 2025)
  } catch (error) {
    console.error('Error in getYearsWithQuestions:', error)
    return []
  }
}
