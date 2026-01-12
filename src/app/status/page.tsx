import { BarChart3, Calendar, CheckCircle2, Clock, Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getPlatformYears, PLATFORM_STATUS } from "@/lib/constants"

export default function StatusPage() {
  const years = getPlatformYears()
  const availableCount = years.filter(y => y.status === 'available').length
  const totalYears = PLATFORM_STATUS.goal.totalYears
  const progressPercentage = (availableCount / totalYears) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Status da Plataforma</h1>
      </div>

      <p className="text-muted-foreground">
        Acompanhe o progresso da disponibilização de todas as provas do ENEM desde 1998.
      </p>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Objetivo da Plataforma</CardTitle>
              <CardDescription>
                Todas as questões do ENEM de 1998 a 2025
              </CardDescription>
            </div>
            <Target className="size-8 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">
                {availableCount} de {totalYears} anos disponíveis
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <CheckCircle2 className="size-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Disponível</p>
                <p className="text-2xl font-bold">{availableCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Clock className="size-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium">Em Progresso</p>
                <p className="text-2xl font-bold">
                  {years.filter(y => y.status === 'in-progress').length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Calendar className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Planejado</p>
                <p className="text-2xl font-bold">
                  {years.filter(y => y.status === 'planned').length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Linha do Tempo</CardTitle>
          <CardDescription>
            Status de disponibilidade por ano
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {years.map((item) => (
              <div
                key={item.year}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {item.status === 'available' && (
                    <CheckCircle2 className="size-5 text-green-600 shrink-0" />
                  )}
                  {item.status === 'in-progress' && (
                    <Clock className="size-5 text-amber-600 shrink-0 animate-pulse" />
                  )}
                  {item.status === 'planned' && (
                    <Calendar className="size-5 text-muted-foreground shrink-0" />
                  )}

                  <div>
                    <p className="font-medium">ENEM {item.year}</p>
                    {item.examCount && (
                      <p className="text-sm text-muted-foreground">
                        {item.examCount} dias de prova
                      </p>
                    )}
                  </div>
                </div>

                <Badge
                  variant={
                    item.status === 'available' ? 'default' :
                    item.status === 'in-progress' ? 'secondary' :
                    'outline'
                  }
                >
                  {item.status === 'available' && 'Disponível'}
                  {item.status === 'in-progress' && 'Em Progresso'}
                  {item.status === 'planned' && 'Planejado'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
