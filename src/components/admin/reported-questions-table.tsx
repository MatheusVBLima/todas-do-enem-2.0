"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { ReportedQuestion } from "@/types"

// Map area codes from questionId to display names and colors
const AREA_MAP: Record<string, { label: string; color: string }> = {
  'LI': { label: 'Linguagens', color: '#3B82F6' },      // blue
  'CH': { label: 'Humanas', color: '#F59E0B' },         // amber
  'CN': { label: 'Natureza', color: '#10B981' },        // emerald
  'MT': { label: 'Matemática', color: '#EF4444' },      // red
}

interface ReportedQuestionsTableProps {
  data: ReportedQuestion[]
  isLoading: boolean
}

export function ReportedQuestionsTable({ data, isLoading }: ReportedQuestionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma questão reportada
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Questão</TableHead>
          <TableHead>Ano</TableHead>
          <TableHead>Área</TableHead>
          <TableHead className="text-right">Reports</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((question) => {
          const area = AREA_MAP[question.knowledgeArea] || { label: question.knowledgeArea, color: '#6B7280' }

          return (
            <TableRow key={question.questionId}>
              <TableCell className="font-medium">
                Q{question.questionNumber}
              </TableCell>
              <TableCell>{question.examYear}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  style={{ borderColor: area.color, color: area.color }}
                >
                  {area.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={question.reportCount >= 3 ? "destructive" : "default"}>
                  {question.reportCount}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/${question.questionId}`} target="_blank">
                    <ExternalLink className="size-4" />
                    <span className="sr-only">Ver questão</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
