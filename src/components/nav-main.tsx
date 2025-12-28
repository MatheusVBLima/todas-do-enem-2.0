"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import { getQuestions } from "@/server/actions/questions"
import { getUserGroups } from "@/server/actions/groups"
import { DEV_USER } from "@/lib/dev-user"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    badge?: string
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const queryClient = useQueryClient()
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handlePrefetch = (url: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      // Prefetch based on URL
      if (url === "/") {
        const defaultFilters = {
          anos: [],
          areas: [],
          disciplinas: [],
          busca: "",
          pagina: 1,
        }
        queryClient.prefetchQuery({
          queryKey: queryKeys.questions.list(defaultFilters),
          queryFn: () => getQuestions(defaultFilters),
        })
      } else if (url === "/grupos") {
        queryClient.prefetchQuery({
          queryKey: queryKeys.groups.list(DEV_USER.id),
          queryFn: () => getUserGroups(DEV_USER.id),
        })
      }
    }, 300)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              {item.items ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a
                              href={subItem.url}
                              onMouseEnter={() => handlePrefetch(subItem.url)}
                              onMouseLeave={handleMouseLeave}
                            >
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a
                    href={item.url}
                    onMouseEnter={() => handlePrefetch(item.url)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs font-medium text-muted-foreground">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
