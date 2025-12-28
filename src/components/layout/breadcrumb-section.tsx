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
  grupos: "Grupos",
  redacao: "Redação",
  conta: "Conta",
}

function isCUID(str: string): boolean {
  // CUID format: c + timestamp (base36) + counter + fingerprint + random
  // Example: cmjlvfb6a0000nolexmos2yyx (25 chars, starts with 'c')
  return /^c[a-z0-9]{24}$/i.test(str)
}

export function BreadcrumbSection() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  // Don't show breadcrumb for home page
  if (segments.length === 0) {
    return null
  }

  // Detect if we're on a question or group detail page
  // Question detail is now at root: /[id]
  const isQuestionPage = segments.length === 1 && isCUID(segments[0])
  const isGroupPage = segments[0]?.toLowerCase() === "grupos" && segments.length === 2 && isCUID(segments[1])

  // Fetch question data if needed
  const { data: question, isLoading: isLoadingQuestion } = useQuery({
    queryKey: queryKeys.questions.detail(segments[0]),
    queryFn: () => getQuestion(segments[0]),
    enabled: isQuestionPage && !!segments[0],
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

    // Replace CUID with actual names
    if (isCUID(segment)) {
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
