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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getQuestion } from "@/server/actions/questions"
import { getGroup } from "@/server/actions/groups"
import { getEssay } from "@/server/actions/essays"
import { getSimuladoResult } from "@/server/actions/simulados"
import { getProof } from "@/server/actions/proofs"
import { getUserName } from "@/server/actions/admin"
import { queryKeys } from "@/lib/query-keys"
import { usePrefetchQuestion } from "@/hooks/use-prefetch-question"
import { usePrefetchGroup } from "@/hooks/use-prefetch-group"
import { usePrefetchEssay } from "@/hooks/use-prefetch-essay"

const routeLabels: Record<string, string> = {
  grupos: "Grupos",
  redacao: "Redação",
  conta: "Conta",
  simulados: "Simulados",
  provas: "Provas",
  admin: "Admin",
}

function isCUID(str: string): boolean {
  // CUID format: c + timestamp (base36) + counter + fingerprint + random
  // Example: cmjlvfb6a0000nolexmos2yyx (25 chars, starts with 'c')
  return /^c[a-z0-9]{24}$/i.test(str)
}

function isUUID(str: string): boolean {
  // UUID format: 8-4-4-4-12 hexadecimal characters
  // Example: 08f6fd37-539b-48b8-b89b-842e8b969847
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

export function BreadcrumbSection() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  // Detect if we're on a question, group, or essay detail page
  // Question detail is now at root: /[id]
  const isQuestionPage = segments.length === 1 && isCUID(segments[0])
  const isGroupPage = segments[0]?.toLowerCase() === "grupos" && segments.length === 2 && isCUID(segments[1])
  const isEssayPage = segments[0]?.toLowerCase() === "redacao" && segments.length === 2 && isCUID(segments[1])
  const isSimuladoPage = segments[0]?.toLowerCase() === "simulados" && segments.length === 2 && isCUID(segments[1])
  const isProofPage = segments[0]?.toLowerCase() === "provas" && segments.length === 2 && isCUID(segments[1])
  const isAdminUserPage = segments[0]?.toLowerCase() === "conta" &&
                          segments[1]?.toLowerCase() === "admin" &&
                          segments[2]?.toLowerCase() === "usuarios" &&
                          segments.length === 4 &&
                          isUUID(segments[3])

  // IMPORTANT: Always call all hooks to maintain consistent hook order
  const prefetchQuestion = usePrefetchQuestion()
  const prefetchGroup = usePrefetchGroup()
  const prefetchEssay = usePrefetchEssay()

  // Fetch question data if needed
  const { data: question } = useQuery({
    queryKey: queryKeys.questions.detail(segments[0] || 'placeholder'),
    queryFn: () => getQuestion(segments[0]),
    enabled: isQuestionPage && !!segments[0],
  })

  // Fetch group data if needed
  const { data: group } = useQuery({
    queryKey: queryKeys.groups.detail(segments[1] || 'placeholder'),
    queryFn: async () => {
      const result = await getGroup(segments[1])
      return result.success ? result.data : null
    },
    enabled: isGroupPage && !!segments[1],
  })

  // Fetch essay data if needed
  const { data: essay } = useQuery({
    queryKey: queryKeys.essays.detail(segments[1] || 'placeholder'),
    queryFn: async () => {
      const result = await getEssay(segments[1])
      return result.success ? result.data : null
    },
    enabled: isEssayPage && !!segments[1],
  })

  // Fetch simulado data if needed
  const { data: simulado } = useQuery({
    queryKey: queryKeys.simulados.detail(segments[1] || 'placeholder'),
    queryFn: async () => {
      const result = await getSimuladoResult(segments[1])
      return result.success ? result.data : null
    },
    enabled: isSimuladoPage && !!segments[1],
  })

  // Fetch proof data if needed (use separate key to avoid conflict with page cache)
  const { data: proof } = useQuery({
    queryKey: ['breadcrumb', 'proof', segments[1] || 'placeholder'],
    queryFn: async () => {
      const result = await getProof(segments[1])
      return result.success ? result.data : null
    },
    enabled: isProofPage && !!segments[1],
  })

  // Fetch admin user name if needed
  const { data: adminUser } = useQuery({
    queryKey: ['admin', 'user', segments[3] || 'placeholder'],
    queryFn: async () => {
      const result = await getUserName(segments[3])
      return result.success ? result.data : null
    },
    enabled: isAdminUserPage && !!segments[3],
  })

  // Don't show breadcrumb for home page or single-segment pages (after all hooks are called)
  // Only show when we have at least 2 segments (e.g., /grupos/[id], /redacao/[id])
  if (segments.length === 0 || segments.length === 1) {
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
      // Skip only "usuarios" segment for admin user page (keep "admin")
      if (isAdminUserPage && segment === "usuarios") {
        return null
      }

      let href = `/${segments.slice(0, index + 1).join("/")}`
      const isLast = index === segments.length - 1
      let label = routeLabels[segment] || segment

      // For admin user page, make "admin" link to /conta with tab query param
      if (isAdminUserPage && segment === "admin") {
        href = "/conta?tab=admin"
      }

      // Replace CUID/UUID with actual names
      if (isCUID(segment) || isUUID(segment)) {
        if (isQuestionPage && index === 0) {
          // Question at root: /[id]
          if (question) {
            label = `Q${question.questionNumber} - ${question.exam.year}`
          } else {
            label = "Questão"
          }
        } else if (isGroupPage && index === 1) {
          // Group detail: /grupos/[id]
          if (group) {
            label = group.name
          } else {
            label = "Grupo"
          }
        } else if (isEssayPage && index === 1) {
          // Essay detail: /redacao/[id]
          if (essay) {
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
        } else if (isSimuladoPage && index === 1) {
          // Simulado result: /simulados/[id]
          if (simulado) {
            label = simulado.name
          } else {
            label = "Simulado"
          }
        } else if (isProofPage && index === 1) {
          // Proof detail: /provas/[id]
          if (proof) {
            label = proof.description || `ENEM ${proof.year}${proof.season ? ` - ${proof.season}` : ''}`
          } else {
            label = "Prova"
          }
        } else if (isAdminUserPage && index === 3) {
          // Admin user detail: /conta/admin/usuarios/[id]
          if (adminUser) {
            label = adminUser.name
          } else {
            label = "Usuário"
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
    .filter((item): item is NonNullable<typeof item> => item !== null) // Remove null items (skipped segments)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <div key={item.href} className="flex items-center gap-1.5">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.isLast ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BreadcrumbPage className="max-w-[200px] truncate">{item.label}</BreadcrumbPage>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
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
