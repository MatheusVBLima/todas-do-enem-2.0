"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getQuestion } from "@/server/actions/questions"
import { getGroup } from "@/server/actions/groups"
import { queryKeys } from "@/lib/query-keys"

const routeLabels: Record<string, string> = {
  questoes: "Questões",
  grupos: "Grupos",
  redacao: "Redação",
  conta: "Conta",
}

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

export function BreadcrumbSection() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  // Don't show breadcrumb for home page
  if (segments.length === 0) {
    return null
  }

  // Detect if we're on a question or group detail page
  const isQuestionPage = segments[0]?.toLowerCase() === "questoes" && segments.length >= 2 && isUUID(segments[1])
  const isGroupPage = segments[0]?.toLowerCase() === "grupos" && segments.length >= 2 && isUUID(segments[1])

  // Fetch question data if needed
  const { data: question, isLoading: isLoadingQuestion } = useQuery({
    queryKey: queryKeys.questions.detail(segments[1]),
    queryFn: () => getQuestion(segments[1]),
    enabled: isQuestionPage && !!segments[1],
  })

  // Fetch group data if needed
  const { data: groupResponse, isLoading: isLoadingGroup } = useQuery({
    queryKey: queryKeys.groups.detail(segments[1]),
    queryFn: () => getGroup(segments[1]),
    enabled: isGroupPage && !!segments[1],
  })

  const group = groupResponse?.success ? groupResponse.data : null

  // Build breadcrumb items
  const breadcrumbItems = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    const isLast = index === segments.length - 1
    let label = routeLabels[segment] || segment

    // Replace UUID with actual names
    if (isUUID(segment)) {
      if (isQuestionPage) {
        if (isLoadingQuestion) {
          label = "..."
        } else if (question) {
          label = `Q${question.questionNumber} - ${question.exam.year}`
        } else {
          label = "Questão"
        }
      } else if (isGroupPage) {
        if (isLoadingGroup) {
          label = "..."
        } else if (group) {
          label = group.name
        } else {
          label = "Grupo"
        }
      } else {
        label = "..."
      }
    }

    return {
      label,
      href,
      isLast,
      segment,
    }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <div key={item.href} className="flex items-center gap-1.5">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
