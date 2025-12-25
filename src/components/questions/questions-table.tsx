"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AddToGroupButton } from "@/components/groups/add-to-group-button"
import type { QuestionWithExam } from "@/types"

interface QuestionsTableProps {
  questions: QuestionWithExam[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasMore: boolean
  }
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function QuestionsTable({
  questions,
  pagination,
  onPageChange,
  isLoading,
}: QuestionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/50 p-8 text-center">
        <p className="text-muted-foreground">
          Nenhuma questão encontrada com os filtros selecionados.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {questions.length} de {pagination.total} questões
        </p>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ano</TableHead>
              <TableHead className="w-[100px]">Número</TableHead>
              <TableHead>Área de Conhecimento</TableHead>
              <TableHead>Disciplina</TableHead>
              <TableHead className="w-[200px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>
                  <Badge variant="outline">{question.exam.year}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  #{question.questionNumber}
                </TableCell>
                <TableCell className="text-sm">
                  {question.knowledgeArea}
                </TableCell>
                <TableCell className="text-sm">
                  {question.subject}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <AddToGroupButton
                      questionId={question.id}
                      variant="ghost"
                      size="sm"
                    />
                    <Link href={`/questoes/${question.id}`}>
                      <Button variant="ghost" size="sm" className="gap-2">
                        Ver
                        <ExternalLink className="size-3" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Show first page, current page, and last page with ... in between
              let pageNum: number

              if (pagination.totalPages <= 5) {
                pageNum = i + 1
              } else if (pagination.page <= 3) {
                pageNum = i + 1
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i
              } else {
                pageNum = pagination.page - 2 + i
              }

              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="min-w-9"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasMore}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Próxima
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
