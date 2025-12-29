"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { useRef } from "react"
import Link from "next/link"
import { usePrefetchQuestions } from "@/hooks/use-prefetch-questions"
import { usePrefetchGroups } from "@/hooks/use-prefetch-groups"
import { usePrefetchEssays } from "@/hooks/use-prefetch-essays"

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
  userId,
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
  userId: string | null
}) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const prefetchQuestions = usePrefetchQuestions()
  const prefetchGroups = usePrefetchGroups(userId)
  const prefetchEssays = usePrefetchEssays(userId)

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
        prefetchQuestions(defaultFilters)
      } else if (url === "/grupos") {
        prefetchGroups()
      } else if (url === "/redacao") {
        prefetchEssays()
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
                            <Link
                              href={subItem.url}
                              onMouseEnter={() => handlePrefetch(subItem.url)}
                              onMouseLeave={handleMouseLeave}
                            >
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link
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
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
