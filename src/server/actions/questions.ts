"use server"

import { db } from "@/lib/db"
import { PAGINATION } from "@/lib/constants"
import type { QuestionFilters, PaginatedResponse, QuestionWithExam } from "@/types"

export async function getQuestions(
  filters: QuestionFilters
): Promise<PaginatedResponse<QuestionWithExam>> {
  const { anos, areas, disciplinas, busca, pagina = 1 } = filters
  const pageSize = PAGINATION.DEFAULT_PAGE_SIZE
  const skip = (pagina - 1) * pageSize

  const where: Record<string, unknown> = {}

  // Filtro por anos
  if (anos && anos.length > 0) {
    where.exam = {
      year: { in: anos },
    }
  }

  // Filtro por áreas do conhecimento
  if (areas && areas.length > 0) {
    where.knowledgeArea = { in: areas }
  }

  // Filtro por disciplinas
  if (disciplinas && disciplinas.length > 0) {
    where.subject = { in: disciplinas }
  }

  // Filtro por busca textual
  // NOTA: SQLite usa lowercase para busca case-insensitive
  if (busca && busca.trim()) {
    const searchLower = busca.toLowerCase()
    where.OR = [
      { statement: { contains: searchLower } },
      { context: { contains: searchLower } },
    ]
  }

  const [questions, total] = await Promise.all([
    db.question.findMany({
      where,
      include: {
        exam: true,
      },
      orderBy: [
        { exam: { year: "desc" } },
        { questionNumber: "asc" },
      ],
      skip,
      take: pageSize,
    }),
    db.question.count({ where }),
  ])

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
}

export async function getQuestion(id: string) {
  const question = await db.question.findUnique({
    where: { id },
    include: {
      exam: true,
      groups: {
        include: {
          group: true,
        },
      },
    },
  })

  return question
}

export async function getYearsWithQuestions(): Promise<number[]> {
  const exams = await db.exam.findMany({
    where: {
      questions: {
        some: {},
      },
    },
    select: { year: true },
    orderBy: { year: "desc" },
  })

  return exams.map((e) => e.year)
}
