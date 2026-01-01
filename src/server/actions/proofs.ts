"use server"

import { db } from "@/lib/db"
import type { Proof, ProofFilters, PaginatedResponse, ActionResponse } from "@/types"
import { PAGINATION } from "@/lib/constants"

/**
 * Get paginated list of proofs with filters
 */
export async function getProofs(
  filters: ProofFilters = {}
): Promise<PaginatedResponse<Proof>> {
  try {
    const { anos = [], tipo, pagina = 1 } = filters
    const pageSize = PAGINATION.DEFAULT_PAGE_SIZE

    // Build query
    let query = db
      .from("Exam")
      .select("*", { count: "exact" })
      .not("pdfUrl", "is", null) // Only exams with PDFs

    // Apply filters
    if (anos.length > 0) {
      query = query.in("year", anos)
    }

    if (tipo) {
      query = query.eq("season", tipo)
    }

    // Apply pagination and sorting
    const from = (pagina - 1) * pageSize
    const to = from + pageSize - 1

    query = query
      .order("year", { ascending: false })
      .range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error("[getProofs] Error:", error)
      throw error
    }

    const total = count || 0
    const totalPages = Math.ceil(total / pageSize)

    return {
      data: (data || []) as Proof[],
      pagination: {
        page: pagina,
        pageSize,
        total,
        totalPages,
        hasMore: pagina < totalPages,
      },
    }
  } catch (error) {
    console.error("[getProofs] Unexpected error:", error)
    throw new Error("Erro ao buscar provas")
  }
}

/**
 * Get a single proof by ID
 */
export async function getProof(id: string): Promise<ActionResponse<Proof>> {
  try {
    const { data, error } = await db
      .from("Exam")
      .select("*")
      .eq("id", id)
      .not("pdfUrl", "is", null)
      .single()

    if (error) {
      console.error("[getProof] Error:", error)
      return {
        success: false,
        error: "Prova não encontrada",
      }
    }

    return {
      success: true,
      data: data as Proof,
    }
  } catch (error) {
    console.error("[getProof] Unexpected error:", error)
    return {
      success: false,
      error: "Erro ao buscar prova",
    }
  }
}
