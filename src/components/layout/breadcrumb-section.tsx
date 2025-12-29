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
import { getEssay } from "@/server/actions/essays"
import { queryKeys } from "@/lib/query-keys"
import { usePrefetchQuestion } from "@/hooks/use-prefetch-question"
import { usePrefetchGroup } from "@/hooks/use-prefetch-group"
import { usePrefetchEssay } from "@/hooks/use-prefetch-essay"

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

  // Detect if we're on a question, group, or essay detail page
  // Question detail is now at root: /[id]
  const isQuestionPage = segments.length === 1 && isCUID(segments[0])
  const isGroupPage = segments[0]?.toLowerCase() === "grupos" && segments.length === 2 && isCUID(segments[1])
  const isEssayPage = segments[0]?.toLowerCase() === "redacao" && segments.length === 2 && isCUID(segments[1])

  // IMPORTANT: Always call all hooks to maintain consistent hook order
  const prefetchQuestion = usePrefetchQuestion()
  const prefetchGroup = usePrefetchGroup()
  const prefetchEssay = usePrefetchEssay()

  // Fetch question data if needed
  const { data: question, isLoading: isLoadingQuestion } = useQuery({
    queryKey: queryKeys.questions.detail(segments[0] || 'placeholder'),
    queryFn: () => getQuestion(segments[0]),
    enabled: isQuestionPage && !!segments[0],
  })

  // Fetch group data if needed
  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: queryKeys.groups.detail(segments[1] || 'placeholder'),
    queryFn: async () => {
      const result = await getGroup(segments[1])
      return result.success ? result.data : null
    },
    enabled: isGroupPage && !!segments[1],
  })

  // Fetch essay data if needed
  const { data: essay, isLoading: isLoadingEssay } = useQuery({
    queryKey: queryKeys.essays.detail(segments[1] || 'placeholder'),
    queryFn: async () => {
      const result = await getEssay(segments[1])
      return result.success ? result.data : null
    },
    enabled: isEssayPage && !!segments[1],
  })

  // Don't show breadcrumb for home page (after all hooks are called)
  if (segments.length === 0) {
    return null
  }

  // Helper function to handle prefetch on hover
  const handlePrefetch = (segment: string, index: number) => {
    if (isCUID(segment)) {
      if (isQuestionPage && index === 0) {
        prefetchQuestion(segment)
      } else if (isGroupPage && index === 1) {
        prefetchGroup(segment)
      } else if (isEssayPage && index === 1) {
        prefetchEssay(segment)
      }
    }
  }

  // Build breadcrumb items
  const breadcrumbItems = segments
    .map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`
      const isLast = index === segments.length - 1
      let label = routeLabels[segment] || segment

      // Replace CUID with actual names
      if (isCUID(segment)) {
        if (isQuestionPage && index === 0) {
          // Question at root: /[id]
          if (isLoadingQuestion) {
            label = "..."
          } else if (question) {
            label = `Q${question.questionNumber} - ${question.exam.year}`
          } else {
            label = "Questão"
          }
        } else if (isGroupPage && index === 1) {
          // Group detail: /grupos/[id]
          if (isLoadingGroup) {
            label = "..."
          } else if (group) {
            label = group.name
          } else {
            label = "Grupo"
          }
        } else if (isEssayPage && index === 1) {
          // Essay detail: /redacao/[id]
          if (isLoadingEssay) {
            label = "..."
          } else if (essay) {
            // Use title if available, otherwise first 3 words of content
            if (essay.title && essay.title.trim()) {
              label = essay.title
            } else {
              const words = essay.content.trim().split(/\s+/).slice(0, 3)
              label = words.join(" ") + (words.length >= 3 ? "..." : "")
            }
          } else {
            label = "Redação"
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
        index,
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
                  <Link
                    href={item.href}
                    onMouseEnter={() => handlePrefetch(item.segment, item.index)}
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
