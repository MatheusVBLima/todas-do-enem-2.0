"use client"

import { useQuery } from "@tanstack/react-query"
import { Flag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getReportedQuestions } from "@/server/actions/reports"
import { ReportedQuestionsTable } from "@/components/admin/reported-questions-table"
import { queryKeys } from "@/lib/query-keys"

export default function AdminReportsPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: queryKeys.reports.list(),
    queryFn: async () => {
      const result = await getReportedQuestions()
      if (!result.success) throw new Error(result.error)
      return result.data!
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/conta">
            <ArrowLeft className="size-4" />
            <span className="sr-only">Voltar</span>
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <Flag className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Questões Reportadas</h1>
        </div>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports de Questões</CardTitle>
          <CardDescription>
            Lista de questões que foram reportadas pelos usuários, ordenadas por número de reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportedQuestionsTable data={reports || []} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
