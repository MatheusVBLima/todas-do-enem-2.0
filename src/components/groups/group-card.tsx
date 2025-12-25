"use client"

import Link from "next/link"
import { FolderOpen, MoreVertical, Pencil, Trash2, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getGroup } from "@/server/actions/groups"
import { queryKeys } from "@/lib/query-keys"

type GroupCardProps = {
  group: {
    id: string
    name: string
    description: string | null
    color: string
    _count: {
      questions: number
    }
  }
  onEdit?: () => void
  onDelete?: () => void
}

export function GroupCard({ group, onEdit, onDelete }: GroupCardProps) {
  const { data: groupDetails } = useQuery({
    queryKey: queryKeys.groups.detail(group.id),
    queryFn: () => getGroup(group.id),
    enabled: false, // Only fetch on hover
  })

  const questions = groupDetails?.success && groupDetails.data ? groupDetails.data.questions : []
  const previewQuestions = questions.slice(0, 3)

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Card className="group relative overflow-hidden transition-all hover:shadow-md">
          <Link href={`/grupos/${group.id}`} className="block">
        <div
          className="absolute left-0 top-0 h-full w-1"
          style={{ backgroundColor: group.color }}
        />

        <CardHeader className="pl-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-1 items-center gap-2">
              <FolderOpen className="size-5" style={{ color: group.color }} />
              <CardTitle className="line-clamp-1">
                {group.name}
              </CardTitle>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 size-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 size-4" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {group.description && (
            <CardDescription className="line-clamp-2 pl-7">
              {group.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="pl-6">
          <Badge variant="secondary">
            {group._count.questions} {group._count.questions === 1 ? "questão" : "questões"}
          </Badge>
        </CardContent>
      </Link>
    </Card>
      </HoverCardTrigger>

      <HoverCardContent className="w-80" side="right" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="size-5" style={{ color: group.color }} />
            <h4 className="font-semibold">{group.name}</h4>
          </div>

          {group.description && (
            <p className="text-sm text-muted-foreground">{group.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="size-4" />
              <span>
                {previewQuestions.length > 0
                  ? "Primeiras questões:"
                  : "Nenhuma questão ainda"}
              </span>
            </div>

            {previewQuestions.length > 0 && (
              <ul className="space-y-1.5">
                {previewQuestions.map((item) => (
                  <li
                    key={item.question.id}
                    className="rounded-md border bg-muted/50 p-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="shrink-0">
                        {item.question.exam.year}
                      </Badge>
                      <span className="line-clamp-1 flex-1">
                        {item.question.knowledgeArea} - {item.question.subject}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {questions.length > 3 && (
              <p className="text-xs text-muted-foreground">
                + {questions.length - 3} questões a mais
              </p>
            )}
          </div>

          <div className="pt-2 text-xs text-muted-foreground">
            Clique para ver todas as questões
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
